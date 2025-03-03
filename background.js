chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveAnswer") {
    fetch("https://test.technoadmin.ru/api/saveAnswers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.data)
    });
  } else if (message.action === "getAnswer") {
    fetch("https://test.technoadmin.ru/api/get?question=" + encodeURIComponent(message.question))
      .then(res => res.json())
      .then(data => sendResponse(data))
      .catch(() => sendResponse(null));
    return true;
  }
});
