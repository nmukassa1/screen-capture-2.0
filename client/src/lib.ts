export async function logToConsoleViaExtension(arg: unknown) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: (arg) => {
        console.log(arg);
      },
      args: [arg]
    });
  }