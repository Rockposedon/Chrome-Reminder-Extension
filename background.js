
// 1111111111111111111
// chrome.runtime.onInstalled.addListener(() => {
//   console.log('Extension installed or updated.');
// });

// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === 'myReminderAlarm') {
//     chrome.storage.local.get('reminderText', (data) => {
//       const reminderText = data.reminderText || 'Default Reminder Message';

//       // Create a custom notification with the snooze button
//       chrome.notifications.create('myReminderNotification', {
//         type: 'basic',
//         iconUrl: 'images/icon48.png',
//         title: 'Reminder',
//         message: reminderText,
//         buttons: [{ title: 'Snooze for 10 Minutes' }],
//       });

//       // Send a message to the popup script to trigger audio playback
//       console.log('Sending message to play audio...');
//       chrome.runtime.sendMessage({ type: 'playAudio' });

//       // Clear the alarm to ensure it only triggers once
//       chrome.alarms.clear('myReminderAlarm');
//     });
//   }
// });

// // Handle notification button click events
// chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
//   if (notificationId === 'myReminderNotification' && buttonIndex === 0) {
//     // Send a message to the popup script to trigger snooze
//     console.log('Button clicked, sending message to snooze...');
//     chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, { type: 'snooze' });
//     });

//     // Close the notification
//     chrome.notifications.clear('myReminderNotification');
//   }
// });

// // Listen for a message from the popup script to play audio
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.type === 'playAudio') {
//     console.log('Received message to play audio...');
//     var audio = new Audio('audio1.mp3');
//     audio.play();
//   }
// });


//  2 ------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated.');
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'myReminderAlarm') {
    chrome.storage.local.get('reminderText', (data) => {
      const reminderText = data.reminderText || 'Default Reminder Message';

      // Create a custom notification with the snooze button
      chrome.notifications.create('myReminderNotification', {
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Reminder',
        message: reminderText,
        buttons: [{ title: 'Snooze for 10 Minutes' }],
      });

      // Send a message to the popup script to trigger audio playback
      chrome.runtime.sendMessage({ type: 'playAudio' });

      // Clear the alarm to ensure it only triggers once
      chrome.alarms.clear('myReminderAlarm');
    });
  }
});

// Handle notification button click events
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'myReminderNotification' && buttonIndex === 0) {
    // Send a message to the popup script to trigger snooze
    console.log('Button clicked, sending message to snooze...');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'snooze' });
    });

    // Close the notification
    chrome.notifications.clear('myReminderNotification');
  }
});

// Listen for a message from the popup script to play audio
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'playAudio') {
    console.log('Received message to play audio...');
    var audio = new Audio('audio1.mp3');
    audio.play();
  }
});
