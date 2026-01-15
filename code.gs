// --- CONFIGURATION ---
var PERSONAL_CALENDAR_ID = 'your.personal@gmail.com'; 
var WORK_CALENDAR_ID = 'primary'; 
var SYNC_DAYS = 60; 
var EVENT_TITLE = "Busy"; 
// ---------------------

function syncCalendars() {
  var personalCal = CalendarApp.getCalendarById(PERSONAL_CALENDAR_ID);
  var workCal = CalendarApp.getCalendarById(WORK_CALENDAR_ID);
  var now = new Date();
  var end = new Date();
  end.setDate(now.getDate() + SYNC_DAYS);

  var personalEvents = personalCal.getEvents(now, end);
  var workEvents = workCal.getEvents(now, end);

  Logger.log("--- STARTING SYNC ---");

  // Map Work events by Fingerprint {SIG: ID_StartTime}
  var syncedWorkEventsMap = {};
  for (var i = 0; i < workEvents.length; i++) {
    var wEvent = workEvents[i];
    var desc = wEvent.getDescription();
    if (desc.indexOf("Synced from Personal Calendar") !== -1) {
       var fingerprint = getFingerprintFromDesc(desc);
       if (fingerprint) syncedWorkEventsMap[fingerprint] = wEvent;
    }
  }

  // Iterate Personal Events
  for (var i = 0; i < personalEvents.length; i++) {
    var pEvent = personalEvents[i];
    if (pEvent.isAllDayEvent()) continue;

    var uniqueFingerprint = pEvent.getId() + "_" + pEvent.getStartTime().getTime();

    if (syncedWorkEventsMap[uniqueFingerprint]) {
      // UPDATE
      var existingEvent = syncedWorkEventsMap[uniqueFingerprint];
      if (existingEvent.getEndTime().getTime() !== pEvent.getEndTime().getTime()) {
        existingEvent.setTime(pEvent.getStartTime(), pEvent.getEndTime());
        logDetails("UPDATED", existingEvent, uniqueFingerprint);
      }
      delete syncedWorkEventsMap[uniqueFingerprint];
    } else {
      // CREATE
      try {
        var descriptionWithSig = "Synced from Personal Calendar\n\n{SIG: " + uniqueFingerprint + "}";
        var newEvent = workCal.createEvent(
          EVENT_TITLE, pEvent.getStartTime(), pEvent.getEndTime(),
          { description: descriptionWithSig, visibility: CalendarApp.Visibility.PRIVATE }
        );
        logDetails("CREATED", newEvent, uniqueFingerprint);
      } catch (e) { Logger.log('[ERROR] ' + e.toString()); }
    }
  }

  // DELETE ORPHANS
  for (var key in syncedWorkEventsMap) {
    var orphanEvent = syncedWorkEventsMap[key];
    logDetails("DELETED", orphanEvent, key);
    orphanEvent.deleteEvent();
  }
}

function getFingerprintFromDesc(description) {
  var match = description.match(/\{SIG:\s*([^\}]+)\}/);
  return match ? match[1] : null;
}

function logDetails(action, event, sig) {
  var fmt = "EEE, MMM d @ HH:mm"; 
  var timeZone = Session.getScriptTimeZone();
  Logger.log("[" + action + "] " + event.getTitle() + " | " + 
    Utilities.formatDate(event.getStartTime(), timeZone, fmt) + " - " + 
    Utilities.formatDate(event.getEndTime(), timeZone, fmt) + " | SIG: " + sig);
