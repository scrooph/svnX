//
// FavoriteWorkingCopies.m - Manage Working Copies list window
//

#import "FavoriteWorkingCopies.h"
#import "MyRepository.h"
#import "MyWorkingCopy.h"
#import "MySvn.h"
#import "CommonUtils.h"


static NSString* const kDocType = @"workingCopy";
static /*const*/ EditListPrefKeys kPrefKeys =
	{ @"favoriteWorkingCopies", @"wcEditShown", @"wcPanelFrame"/*, NSFilenamesPboardType*/ };


//----------------------------------------------------------------------------------------

@implementation FavoriteWorkingCopies

- (id) init
{
	kPrefKeys.dragType = NSFilenamesPboardType;
	if (self = [super init: &kPrefKeys])
	{
	}

	return self;
}


//----------------------------------------------------------------------------------------

- (void) dealloc
{
	[[NSNotificationCenter defaultCenter] removeObserver: self];
	[[NSUserDefaultsController sharedUserDefaultsController] removeObserver: self];

	[super dealloc];
}


//----------------------------------------------------------------------------------------

- (id) newObject: (NSPasteboard*) pboard
{
	id obj = nil;
	NSString* filePath = [[pboard propertyListForType: NSFilenamesPboardType] lastObject];
	if (filePath)
	{
		obj = [fAC newObject];
		[obj setValue: filePath                     forKey: @"fullPath"];
		[obj setValue: [filePath lastPathComponent] forKey: @"name"];
	}
	return obj;
}


//----------------------------------------------------------------------------------------

- (id) newObjectWithName: (NSString*) name
	   path:              (NSString*) path
	   username:          (NSString*) username
	   password:          (NSString*) password
{
	return [NSMutableDictionary dictionaryWithObjectsAndKeys:
				name,								@"name",
				[path stringByStandardizingPath],	@"fullPath",
				username,							@"user",
				password,							@"pass",
				nil];
}


//----------------------------------------------------------------------------------------

- (id) newObjectWithName: (NSString*) name
					path: (NSString*) path
{
	return [self newObjectWithName: name
							  path: path
						  username: @""
						  password: @""];
}


//----------------------------------------------------------------------------------------
#pragma mark	-
//----------------------------------------------------------------------------------------

- (void) awakeFromNib
{
	// Notification for user creating a new working copy => will add item into favorites list.
	[[NSNotificationCenter defaultCenter] addObserver: self
		selector: @selector(newWorkingCopyNotificationHandler:) name: @"newWorkingCopy" object: nil];

	[[NSUserDefaultsController sharedUserDefaultsController]
							addObserver: self
							forKeyPath:  @"values.abbrevWCFilePaths"
							options:     0
							context:     NULL];

	[super awakeFromNib];
}


//----------------------------------------------------------------------------------------

- (void) observeValueForKeyPath: (NSString*)     keyPath
		 ofObject:               (id)            object
		 change:                 (NSDictionary*) change
		 context:                (void*)         context
{
	#pragma unused(keyPath, object, change, context)
	[fTableView setNeedsDisplay: TRUE];
}


//----------------------------------------------------------------------------------------

- (void) newWorkingCopyNotificationHandler: (NSNotification*) notification
{
	NSDictionary* obj = [notification object];
	ConstString name = [NSString stringWithFormat: @"%@ Working Copy", [obj objectForKey: @"name"]];
	[fAC addObject: [self newObjectWithName: name
									   path: [obj objectForKey: @"path"]
								   username: [obj objectForKey: @"username"]
								   password: [obj objectForKey: @"password"]]];
	[super newItem: self];

	[fWindow makeKeyAndOrderFront: nil];
}


//----------------------------------------------------------------------------------------

- (IBAction) newItem: (id) sender
{
	#pragma unused(sender)
	[self newWorkingCopyItemWithPath: NSHomeDirectory()];
}


//----------------------------------------------------------------------------------------
// Adds a new working copy with the given path.

- (void) newWorkingCopyItemWithPath: (NSString*) workingCopyPath
{
	[fAC addObject: [self newObjectWithName: @"My Project" path: workingCopyPath]];
	[super newItem: self];
}


//----------------------------------------------------------------------------------------

- (BOOL) showExtantWindow: (NSString*) name
		 fullPath:         (NSString*) fullPath
{
	for_each_obj(en, doc, [[NSDocumentController sharedDocumentController] documents])
	{
		if ([[doc fileType] isEqualToString: kDocType] &&
			[[doc windowTitle] isEqualToString: name] &&
			[[doc workingCopyPath] isEqualToString: fullPath])
		{
			[doc showWindows];
			return TRUE;
		}
	}

	return FALSE;
}


//----------------------------------------------------------------------------------------

- (MyWorkingCopy*) openNewDocument: (NSDictionary*) workingCopy
{
	NSString* const name = [workingCopy objectForKey: @"name"];
	// The controller needs the name in awakeFromNib, but the document doesn't know it until later.
	[MyWorkingCopy presetDocumentName: name];
	MyWorkingCopy* const newDoc = [[NSDocumentController sharedDocumentController]
										openUntitledDocumentOfType: kDocType display: YES];

	[newDoc setup: name
			user:  [workingCopy objectForKey: @"user"]
			pass:  [workingCopy objectForKey: @"pass"]
			path:  [workingCopy objectForKey: @"fullPath"]];

	return newDoc;
}


//----------------------------------------------------------------------------------------

- (void) onDoubleClick: (id) sender
{
	#pragma unused(sender)
	NSArray* selectedObjects = [fAC selectedObjects];
	NSDictionary* selection;
	if ([selectedObjects count] != 0 && (selection = [selectedObjects objectAtIndex: 0]) != nil)
	{
		// If no option-key then look for & try to activate extant Working Copy window.
		if (AltOrShiftPressed() ||
			![self showExtantWindow: [selection objectForKey: @"name"]
				   fullPath:         [selection objectForKey: @"fullPath"]])
		{
			[self openNewDocument: selection];
		}
	}
}


//----------------------------------------------------------------------------------------

- (IBAction) openPath: (id) sender
{
	#pragma unused(sender)
	NSString* selectionPath = [fAC valueForKeyPath: @"selection.fullPath"];

	if (selectionPath == nil )
	{
		selectionPath = NSHomeDirectory();
	}

	NSOpenPanel* const oPanel = [NSOpenPanel openPanel];
	[oPanel setAllowsMultipleSelection: NO];
	[oPanel setCanChooseDirectories:    YES];
	[oPanel setCanChooseFiles:          NO];

	[oPanel beginSheetForDirectory: selectionPath file: nil types: nil modalForWindow: fWindow
					 modalDelegate: self
					didEndSelector: @selector(openPathDidEnd:returnCode:contextInfo:)
					   contextInfo: nil];
}


//----------------------------------------------------------------------------------------

- (void) openPathDidEnd: (NSOpenPanel*) sheet
		 returnCode:     (int)          returnCode
		 contextInfo:    (void*)        contextInfo
{
	#pragma unused(contextInfo)
	if (returnCode == NSOKButton)
	{
		NSString* pathToFile = [[[sheet filenames] objectAtIndex: 0] copy];
		[fAC setValue: pathToFile forKeyPath: @"selection.fullPath"];
		[self savePreferences];
	}
}


//----------------------------------------------------------------------------------------
// Private:
// Find an extant MyWorkingCopy for <aPath> or find a working copy dict & create a MyWorkingCopy

- (id) findWorkingCopy: (NSString*) aPath
	   openIt:          (BOOL)      openIt
{
	int bestMatchScore = 0;

	// Find among the open working copies one that has a matching path
	MyWorkingCopy* wcDocument = nil;
	for_each_obj(en1, it, [[NSDocumentController sharedDocumentController] documents])
	{
		if ([[it fileType] isEqualToString: kDocType])
		{
			NSRange r = [aPath rangeOfString: [it workingCopyPath]
									 options: NSLiteralSearch | NSAnchoredSearch];
			if (r.location == 0 && r.length > bestMatchScore)
			{
				// we found a matching working copy that is currently open in svnX
				wcDocument = it;
				bestMatchScore = r.length;
			}
		}
	}

	// Find among the known working copies one that has a matching path
	NSDictionary* wcEntry = nil;
	for_each_obj(en2, it, [fAC arrangedObjects])
	{
		NSRange r = [aPath rangeOfString: [it objectForKey: @"fullPath"]
								 options: NSLiteralSearch | NSAnchoredSearch];
		if (r.location == 0 && r.length > bestMatchScore)
		{
			wcEntry = it;
			bestMatchScore = r.length;
		}
	}

	if (!openIt)
		return wcEntry ? wcEntry : (id) wcDocument;

	// if we found a matching working copy that is not currently open, then let's open it
	if (wcEntry != nil)
		wcDocument = [self openNewDocument: wcEntry];

	return wcDocument;
}


//----------------------------------------------------------------------------------------
// Invoked from AppleScript.

- (void) openWorkingCopy: (NSString*) aPath
{
	MyWorkingCopy* wcDocument = [self findWorkingCopy: aPath openIt: TRUE];
	if (wcDocument != nil)
		[wcDocument showWindows];
	else
		[self openNewDocument: [self newObjectWithName: [aPath lastPathComponent] path: aPath]];
}


//----------------------------------------------------------------------------------------
// Invoked from AppleScript.

- (void) fileHistoryOpenSheetForItem: (NSString*) aPath
{
	MyWorkingCopy* wcDocument = [self findWorkingCopy: aPath openIt: TRUE];
	if (wcDocument != nil)
	{
		[[wcDocument controller] fileHistoryOpenSheetForItem: [self newObjectWithName: @"" path: aPath]];
	}
	else
	{
		NSRunAlertPanel(@"No working copy found.",
						[NSString stringWithFormat:
								@"svnX cannot find a working copy for the file %C%@%C.\n\n"
								 "Please make sure that the working copy that owns the file"
								 " is defined in svnX's Working Copies window.",
								 0x201C, aPath, 0x201D],
						@"Cancel", nil, nil);
	}
}


//----------------------------------------------------------------------------------------
// Invoked from AppleScript.

- (void) diffFiles: (id) fileOrFiles
{
	NSString* aPath;
	if ([fileOrFiles isKindOfClass: [NSArray class]])
		aPath = [fileOrFiles objectAtIndex: 0];
	else
		fileOrFiles = [NSArray arrayWithObject: (aPath = fileOrFiles)];

	const id wcObj = [self findWorkingCopy: aPath openIt: FALSE];
	if (wcObj && [wcObj isKindOfClass: [MyWorkingCopy class]])
	{
		[wcObj diffItems: fileOrFiles];
	}
	else	// Working Copy dict or unknown
	{
		[MySvn	diffItems: fileOrFiles
		   generalOptions: wcObj ? MakeCallbackInvocation(wcObj, @selector(self)) : nil
				  options: nil
				 callback: MakeCallbackInvocation(self, @selector(doNothing:))
			 callbackInfo: nil
				 taskInfo: [NSDictionary dictionaryWithObject:
								wcObj ? [wcObj objectForKey: @"name"] : @"" forKey: @"documentName"]];
	}
}


//----------------------------------------------------------------------------------------
// Invoked from AppleScript.

- (void) resolveFiles: (id) fileOrFiles
{
	NSString* aPath;
	if (ISA(fileOrFiles, NSArray))
		aPath = [fileOrFiles objectAtIndex: 0];
	else
		fileOrFiles = [NSArray arrayWithObject: (aPath = fileOrFiles)];

	const id wcObj = [self findWorkingCopy: aPath openIt: FALSE];
	if (wcObj && ISA(wcObj, MyWorkingCopy))
	{
		[(MyWorkingCopy*) wcObj resolveFiles: fileOrFiles];
	}
	else	// Working Copy dict or unknown
	{
		[MySvn runScript: @"svnresolve"
				 options: [NSArray arrayWithObjects: SvnCmdPath(), GetDiffAppName(), nil]
					args: fileOrFiles
					name: @"resolve"
				callback: MakeCallbackInvocation(self, @selector(doNothing:))
			callbackInfo: nil
				taskInfo: [NSDictionary dictionaryWithObject:
								[wcObj objectForKey: @"name"] forKey: @"documentName"]
				dataOnly: NO];
	}
}


//----------------------------------------------------------------------------------------

- (void) doNothing: (id) taskObj
{
	#pragma unused(taskObj)
}


@end

//----------------------------------------------------------------------------------------
// End of FavoriteWorkingCopies.m
