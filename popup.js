// 11111111111
function playAudio() {
  var audio = document.getElementById('reminder-audio');
  audio.play();
}

function createReminder(reminderData) {
  // This function should handle setting alarms and notifications based on the reminderData provided
  chrome.alarms.create('myReminderAlarm', {
    when: reminderData.time,
  });

  chrome.storage.local.set({ 'reminderText': reminderData.text });

  // Send a message to the background script to trigger audio playback
  chrome.runtime.sendMessage({ type: 'playAudio' });

  // Display the success message with the provided reminder text
  var messageDiv = document.getElementById("message");
  messageDiv.textContent = "Reminder set successfully: " + reminderData.text;

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'snooze') {
      // Handle snooze button click
      // Snooze the reminder for 10 minutes (600,000 milliseconds)
      chrome.alarms.create('myReminderAlarm', {
        when: Date.now() + 600000 // 10 minutes in milliseconds
      });

      // Update the success message
      messageDiv.textContent = "Reminder snoozed for 10 minutes.";
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  var setReminderButton = document.getElementById("set-reminder-button");
  var snoozeButton = document.getElementById("snooze-button");
  var reminderListButton = document.getElementById("reminder-list-button");
  var reminderListContainer = document.getElementById("reminder-list-container");
  var reminderList = document.getElementById("reminder-list");
  var reminders = [];

  // Load reminders from Chrome storage and display
  chrome.storage.local.get(['reminders'], function(result) {
    if (result.reminders && Array.isArray(result.reminders)) {
      reminders = result.reminders;
      updateReminderList();
    }
  });

  function updateReminderList() {
    reminderList.innerHTML = '';
    for (var i = 0; i < reminders.length; i++) {
      var listItem = document.createElement('li');
      listItem.textContent = reminders[i];
      var editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', editReminder(i));
      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', deleteReminder(i));
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      reminderList.appendChild(listItem);
    }
  }

  function editReminder(index) {
    return function() {
      var updatedReminder = prompt('Edit reminder:', reminders[index]);
      if (updatedReminder) {
        reminders[index] = updatedReminder;
        updateReminderList();
        saveReminders();
      }
    };
  }

  function deleteReminder(index) {
    return function() {
      if (confirm('Are you sure you want to delete this reminder?')) {
        reminders.splice(index, 1);
        updateReminderList();
        saveReminders();
      }
    };
  }

  function saveReminders() {
    chrome.storage.local.set({ 'reminders': reminders });
  }

  setReminderButton.addEventListener("click", function() {
    var reminderInput = document.getElementById("reminder-text").value;
    var regex = /remind me to (.+) in (\d+) (second|seconds|minute|minutes|hour|hours|day|days|year|years)/i;
    var matches = reminderInput.match(regex);

    if (matches && matches.length === 4) {
      var reminderText = matches[1];
      var quantity = parseInt(matches[2], 10);
      var unit = matches[3].toLowerCase();
      var timeInMilliseconds = getMilliseconds(unit, quantity);
      var currentTime = new Date();
      var selectedDate = new Date(currentTime.getTime() + timeInMilliseconds);
      createReminder({
        text: reminderText,
        time: selectedDate.getTime()
      });
      document.getElementById("reminder-text").value = '';
      reminders.push(reminderText);
      updateReminderList();
      saveReminders();
    } else {
      var timeInMilliseconds = parseTimeInput(reminderInput);
      if (timeInMilliseconds > 0) {
        var currentTime = new Date();
        var selectedDate = new Date(currentTime.getTime() + timeInMilliseconds);
        createReminder({
          text: reminderInput,
          time: selectedDate.getTime()
        });
        document.getElementById("reminder-text").value = '';
        reminders.push(reminderInput + ' (' + selectedDate.toLocaleTimeString() + ')');
        updateReminderList();
        saveReminders();
      } else {
        var messageDiv = document.getElementById("message");
        messageDiv.textContent = "Invalid reminder format. Please use a format like 'Remind me to drink water in 1 minute' or 'Remind me to take a bath at 1 PM'.";
      }
    }
  });

  reminderListButton.addEventListener("click", function() {
    reminderListContainer.style.display = "block";
    updateReminderList();
  });

  snoozeButton.addEventListener("click", function() {
    createSnoozeReminder();
  });

  function createSnoozeReminder() {
    var currentTime = new Date();
    var snoozeTime = new Date(currentTime.getTime() + 10 * 60 * 1000); // 10 minutes
    createReminder({
      text: "Snoozed Reminder",
      time: snoozeTime.getTime()
    });
    snoozeButton.style.display = "none";
  }

  function getMilliseconds(unit, quantity) {
    switch (unit) {
      case 'second':
      case 'seconds':
        return quantity * 1000;
      case 'minute':
      case 'minutes':
        return quantity * 60 * 1000;
      case 'hour':
      case 'hours':
        return quantity * 60 * 60 * 1000;
      case 'day':
      case 'days':
        return quantity * 24 * 60 * 60 * 1000;
      case 'year':
      case 'years':
        return quantity * 365 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  function parseTimeInput(timeInput) {
    const regex = /(\d+):(\d+)\s*([ap]m)/i;
    const match = timeInput.match(regex);

    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toLowerCase();

      // Convert 12-hour time to 24-hour time
      const adjustedHours = period === 'pm' ? hours + 12 : hours;

      // Create a Date object with the current date and the specified time
      const currentTime = new Date();
      const selectedTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), adjustedHours, minutes);

      // Calculate the time difference in milliseconds
      return selectedTime.getTime() - currentTime.getTime();
    }

    return 0;
  }
});

// 22222222222

// ---------------------------
// function playAudio() {
//   var audio = document.getElementById('reminder-audio');
//   audio.play();
// }

// function createReminder(reminderData) {
//   // This function should handle setting alarms and notifications based on the reminderData provided
//   chrome.alarms.create('myReminderAlarm', {
//     when: reminderData.time,
//   });

//   // Store reminders in an array
//   chrome.storage.local.get(['reminders'], function(result) {
//     var reminders = result.reminders || [];
//     reminders.push({ text: reminderData.text, time: reminderData.time });
//     chrome.storage.local.set({ 'reminders': reminders });

//     // Update the reminder list
//     // updateReminderList(reminders);
//   });

//   // Send a message to the background script to trigger audio playback
//   chrome.runtime.sendMessage({ type: 'playAudio' });

//   // Display the success message with the provided reminder text
//   var messageDiv = document.getElementById("message");
//   messageDiv.textContent = "Reminder set successfully: " + reminderData.text;
// }

// document.addEventListener("DOMContentLoaded", function () {
//   var setReminderButton = document.getElementById("set-reminder-button");
//   var snoozeButton = document.getElementById("snooze-button");
//   var reminderListButton = document.getElementById("reminder-list-button");
//   var reminderListContainer = document.getElementById("reminder-list-container");
//   var reminderList = document.getElementById("reminder-list");

//   // Load reminders from Chrome storage and display
//   chrome.storage.local.get(['reminders'], function (result) {
//     var reminders = result.reminders || [];
//     updateReminderList(reminders);
//   });

//   function updateReminderList(reminders) {
//     reminderList.innerHTML = '';
//     for (var i = 0; i < reminders.length; i++) {
//       var listItem = document.createElement('li');
//       listItem.textContent = reminders[i].text + ' (at ' + new Date(reminders[i].time) + ')';
//       var editButton = document.createElement('button');
//       editButton.textContent = 'Edit';
//       editButton.addEventListener('click', editReminder(i));
//       var deleteButton = document.createElement('button');
//       deleteButton.textContent = 'Delete';
//       deleteButton.addEventListener('click', deleteReminder(i));
//       listItem.appendChild(editButton);
//       listItem.appendChild(deleteButton);
//       reminderList.appendChild(listItem);
//     }
//   }

//   function editReminder(index) {
//     return function () {
//       var updatedReminder = prompt('Edit reminder:', reminders[index].text);
//       if (updatedReminder) {
//         reminders[index].text = updatedReminder;
//         updateReminderList(reminders);
//         saveReminders(reminders);
//       }
//     };
//   }

//   function deleteReminder(index) {
//     return function () {
//       if (confirm('Are you sure you want to delete this reminder?')) {
//         reminders.splice(index, 1);
//         updateReminderList(reminders);
//         saveReminders(reminders);
//       }
//     };
//   }

//   function saveReminders(reminders) {
//     chrome.storage.local.set({ 'reminders': reminders });
//   }

//   setReminderButton.addEventListener("click", function () {
//     var reminderInput = document.getElementById("reminder-text").value;
//     var regex = /remind me to (.+) at (\d+:\d+(?:\s?[apAP]\.m\.?)?)|in (\d+) (second|seconds|minute|minutes|hour|hours|day|days|year|years)/i;
//     var matches = reminderInput.match(regex);
//     if (matches && (matches[2] || matches[4])) {
//       var reminderText = matches[1] || matches[4];
//       var timeString = matches[2];
//       var quantity = parseInt(matches[3], 10) || 0;

//       if (timeString) {
//         // Handle reminders with specific time
//         var time = parseTimeString(timeString);
//         if (time) {
//           var currentTime = new Date();
//           var selectedDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), time.hours, time.minutes);
//           if (time.meridiem && time.meridiem.toLowerCase() === 'pm') {
//             selectedDate.setHours(selectedDate.getHours() + 12);
//           }
//           createReminder({
//             text: reminderText,
//             time: selectedDate.getTime()
//           });
//         } else {
//           showInvalidFormatMessage();
//         }
//       } else {
//         // Handle reminders with a relative time
//         var unit = matches[5].toLowerCase();
//         var timeInMilliseconds = getMilliseconds(unit, quantity);
//         var currentTime = new Date();
//         var selectedDate = new Date(currentTime.getTime() + timeInMilliseconds);
//         createReminder({
//           text: reminderText,
//           time: selectedDate.getTime()
//         });
//       }

//       document.getElementById("reminder-text").value = '';
//     } else {
//       showInvalidFormatMessage();
//     }
//   });

//   reminderListButton.addEventListener("click", function () {
//     reminderListContainer.style.display = "block";
//   });

//   snoozeButton.addEventListener("click", function () {
//     createSnoozeReminder();
//   });

//   function createSnoozeReminder() {
//     var currentTime = new Date();
//     var snoozeTime = new Date(currentTime.getTime() + 10 * 60 * 1000); // 10 minutes
//     createReminder({
//       text: "Snoozed Reminder",
//       time: snoozeTime.getTime()
//     });
//     snoozeButton.style.display = "none";
//   }

//   function showInvalidFormatMessage() {
//     var messageDiv = document.getElementById("message");
//     messageDiv.textContent = "Invalid reminder format. Please use a format like 'Remind me to drink water at 1 PM' or 'Remind me to take a break in 5 minutes'.";
//   }

//   function parseTimeString(timeString) {
//     var timeRegex = /(\d+):(\d+)\s?([apAP]\.m\.?)?/i;
//     var timeMatches = timeString.match(timeRegex);
//     if (timeMatches && timeMatches.length === 4) {
//       return {
//         hours: parseInt(timeMatches[1], 10),
//         minutes: parseInt(timeMatches[2], 10),
//         meridiem: timeMatches[3]
//       };
//     }
//     return null;
//   }

//   function getMilliseconds(unit, quantity) {
//     switch (unit) {
//       case 'second':
//       case 'seconds':
//         return quantity * 1000;
//       case 'minute':
//       case 'minutes':
//         return quantity * 60 * 1000;
//       case 'hour':
//       case 'hours':
//         return quantity * 60 * 60 * 1000;
//       case 'day':
//       case 'days':
//         return quantity * 24 * 60 * 60 * 1000;
//       case 'year':
//       case 'years':
//         return quantity * 365 * 24 * 60 * 60 * 1000;
//       default:
//         return 0;
//     }
//   }
// });
