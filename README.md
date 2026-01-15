# Sync Google Calendars (Personal → Work)

A robust Google Apps Script to block out time on a Work calendar based on Personal calendar events. It keeps details private ("Busy"), handles recurring events correctly without duplicates, and propagates deletions/updates.

## Setup Guide

### 1. Share Personal Calendar

1. Open **Google Calendar** with your **Personal** account.
2. Go to **Settings and sharing** for the specific calendar.
3. Under **Share with specific people**, add your **Work Email**.


### 2. Install the Script

1. Log into your **Work Account**.
2. Go to [script.google.com](https://script.google.com/) and click **New Project**.
3. Paste [code.gs](/code.gs) into the editor (replace existing code).
4. Update the **Configuration** at the top:
```javascript
var PERSONAL_CALENDAR_ID = 'your.personal@gmail.com';
var WORK_CALENDAR_ID = 'primary'; // Where to create work events; leave as primary for account's default calendar
var SYNC_DAYS = 60; // Days to look ahead
var EVENT_TITLE = "Busy"; // Title for work calendar blocks
```


5. Click the **Save** (disk) icon.

### 3. Run & Authorize

1. Click **Run** in the toolbar.
2. Grant the necessary permissions.
* *Note: If you see "App not verified", click Advanced > Go to (Project Name) (unsafe).*


### 4. Automate (Set Trigger)

1. In the Apps Script sidebar, click the **Alarm Clock icon** (Triggers).
2. Click **+ Add Trigger** (bottom right).
3. Configure:
* **Function:** `syncCalendars`
* **Event source:** `Time-driven`
* **Type:** `Hour timer` (or `Minutes timer` -> `Every 5 minutes`)


4. Click **Save**.
