# code-editor
Code Editing Module to perform a recursive search across directories and perform custom actions on them.

As a custom implementation, the application has in-built capability to search recursively across folders for content and modify the file if required.

# Features
- Lookup for HTML and DOCTYPE in jsp pages
- Searches for the HTML Element 
- When found searches for DOCTYPE element from the beginning of the page to the HTML element line
- When not found ignores the file and proceeds
- User is provided with two options to either check the presence of the DOCTYPE for valid HTML pages or check the presence and introduce one when not available
- Reports the stats at the end of the process
- Provides two different implementation for asyncronous and syncronous file reads

Will be coming up with a generic version of this app and isolate the custom implementation soon.
