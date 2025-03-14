export async function logToConsoleViaExtension(arg: unknown) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [arg],
      func: (arg) => {
        console.log(arg);
      },
    });
  }