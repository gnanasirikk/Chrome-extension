function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes * 60) % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updatePopup() {
  chrome.storage.local.get('tabData', (data) => {
    const timeTable = document.getElementById('timeTable');
    
    // Clear existing rows except the header
    while (timeTable.rows.length > 1) {
      timeTable.deleteRow(1);
    }

    const tabData = data.tabData || {};

    for (const [tabId, tabInfo] of Object.entries(tabData)) {
      const row = timeTable.insertRow(-1);
      const websiteCell = row.insertCell(0);
      const titleCell = row.insertCell(1);
      const timeCell = row.insertCell(2);

      try {
        const hostname = new URL(tabInfo.url).hostname;
        websiteCell.textContent = hostname;
        titleCell.textContent = tabInfo.title;
        timeCell.textContent = formatTime(tabInfo.totalTime);
      } catch (error) {
        console.error("Error processing tab data:", error);
      }
    }
  });
}

// Update the popup when it's opened
document.addEventListener('DOMContentLoaded', updatePopup);

// Refresh the data every second while the popup is open
setInterval(updatePopup, 1000);
