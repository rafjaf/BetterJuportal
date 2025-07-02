# Better Juportal

This Chrome extension enhances the user experience on [Juportal](https://juportal.be/home/accueil), the portal for the Belgian judiciary. It brings several improvements to the search page, the results page, and the case display page.

It is available for [Chrome](https://chromewebstore.google.com/detail/better-juportal/nbljlhcmlagopgiflnlpaniambjicemc) and for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/better-juportal/).

IMPORTANCE NOTICE: If you are using the Firefox extension, the first time you will surf to Justel website, a blue dot will appear on the icon of the extension. You must right-click on the extension icon and grant it permission to always run on juportal.be. Otherwise, the extension will not work.

# Features

## Search Page
![Screenshot](doc/search.png)
- **Saved Searches Displayed by Default**: Your saved searches are immediately visible, no need to click to show them.
- **Quick Text Selection**: Clicking in the text search field automatically selects all the content for faster editing.
- **Enhanced Search Buttons**: The main search buttons are enlarged and centered for better visibility.
- **"Cass." Search Button**: A new "Cass." button is added to allow for a quick search limited to decisions of the Court of Cassation.

## Results Page
![Screenshot](doc/results.png)
- **Quick Actions**: Each result has new buttons to quickly copy the case reference to the clipboard or to download the decision. When an opinion of the advocate general is available, the downloaded file automatically merges it with the case to which it relates.
- **Smart Reference Copying**: You can select a portion of the summary and the case reference will be automatically appended when you copy it.
- **Standardized French Language**: All links to decisions open by default the French version if available.
- **Court of Cassation Case Enhancements**:
    - **Clear Referencing**: Decisions from the Court of Cassation are presented with a clear, standardized reference (e.g., `Cass., 28 juin 2025, n° P.25.1234.F`).
    - **Color-Coded Cases**: The background of the result is color-coded based on the nature of the case (`P`, `C`, `F`, `S`, `D`), making it easy to identify it at a glance.
    - **Advocate General's Opinion**: Links to the opinion of the Advocate General are highlighted in dark blue.
- **Performance**: The extension uses modern browser features to apply these enhancements efficiently, without slowing down the page load.

## Case Page
![Screenshot](doc/case1.png)

![Screenshot](doc/case2.png)
- **Improved Readability**:
    - The layout is cleaned up by hiding unnecessary buttons.
    - The text of the decision is displayed with a larger font and an optimized width for easier reading.
    - Headings within the decision are styled with different colors and margins, creating a clear visual structure.
- **Table of Contents**: A floating table of contents is generated for long decisions, allowing for easy navigation between sections.
- **Court of Cassation Case Enhancements**:
    - **Complete, Clickable Reference**: A full reference is displayed at the top of the page, including the date, case number, and a link to the Advocate General's opinion if available. The reference is clickable to easily navigate back to the decision's page.
    - **Smart Copying**: Copying text from the decision will automatically include the full case reference. You can also copy the reference alone by clicking the copy button.
    - **PDF Download**: A download button allows you to save the decision as a PDF file, with a standardized filename (e.g., `Cass. 2025-06-28 n° P.25.1234.F.pdf`). If an opinion of the Advocate General exists, it is automatically merged with the judgement of the Court.
    - **Pasicrisie Reference**: The extension automatically searches for and displays the reference to the *Pasicrisie* (the official law reports of the Supreme Court) if it is available on the page.
    - **Easy Access to Linked Documents**: If the decision is linked to the Advocate General's opinion (or vice-versa), a button is provided to open the linked document in a new tab.
    - **Advocate General Information**: The name of the Advocate General is fetched and displayed.
    - **Semantic Structuring**: For judgments of the Court of Cassation, the extension identifies and highlights key parts of the text, such as the legal provisions, the contested decision, and - with some basic logic - the Court's central teachings, making the legal reasoning easier to follow.

# Privacy

This extension does not collect, store, or transmit any personal data. All processing occurs locally in your browser, and no information is sent to external servers.

# Credits

- This extension uses the excellent [**pdf-lib**](https://pdf-lib.js.org/) library to create PDF documents.
- [**GitHub Copilot**](https://github.com/features/copilot) was used to review and improve the code.
