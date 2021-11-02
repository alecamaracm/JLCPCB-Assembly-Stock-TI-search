
browser.commands.onCommand.addListener(function (command) {
    if (command === "start-stock") {
        browser.tabs.query({}, (tabs) => tabs.forEach( tab => chrome.tabs.sendMessage(tab.id, "start-stock") ) );           
    }
  });

