const xlsx = require("xlsx");
const fs = require("fs");

function processLogs() {
  try {
    const DEFAULT_LATITUDE = "26.4547555";
    const DEFAULT_LONGITUDE = "87.2727071";

    // Load the device log Excel file
    const deviceLogWorkbook = xlsx.readFile("./data/devicelog.xlsx");
    const deviceLogSheet =
      deviceLogWorkbook.Sheets[deviceLogWorkbook.SheetNames[0]];
    const deviceLogData = xlsx.utils.sheet_to_json(deviceLogSheet);

    // Load the employee mapping JSON
    const employeeMapData = JSON.parse(
      fs.readFileSync("./data/employeeMap.json", "utf8")
    );
    const employeeMap = new Map();
    employeeMapData.forEach((emp) => {
      employeeMap.set(emp.device_id, {
        employee: emp.employee,
        employee_name: emp.employee_name,
      });
    });

    // Process each log entry
    const checkinLogData = deviceLogData.map((log) => {
      const emp = employeeMap.get(log.device_id) || {
        employee: "UNKNOWN",
        employee_name: "UNKNOWN",
      };

      const jsDate = convertExcelDate(log.time_stamp);
      const formattedTime = formatDate(jsDate);
      const day = getDayOfWeek(jsDate);

      return {
        employee: emp.employee,
        employee_name: emp.employee_name,
        log_type: getLogTypeDescription(log.log_type),
        device_id: String(log.device_id),
        time: formattedTime,
        day,
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
      };
    });

    // Write to JSON file
    fs.writeFileSync(
      "./data/checkinlog.json",
      JSON.stringify(checkinLogData, null, 2)
    );
    console.log("✅ Logs processed successfully. Output: data/checkinlog.json");
  } catch (error) {
    console.error("❌ Error processing logs:", error);
  }
}

// 🔁 Convert Excel serial date to JS Date (local time)
function convertExcelDate(serial) {
  const excelEpoch = new Date(1899, 11, 30); // Excel's starting point (Dec 30, 1899)
  const days = Math.floor(serial);
  const milliseconds = Math.round((serial % 1) * 86400 * 1000);
  return new Date(excelEpoch.getTime() + days * 86400 * 1000 + milliseconds);
}

// 📅 Format date as "YYYY-MM-DD HH:mm:ss.SSSSSS"
function formatDate(date) {
  const pad = (n, z = 2) => String(n).padStart(z, "0");
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 6); // pad to 6 digits like microseconds
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}.${ms}`;
}

// 📆 Get day of the week
function getDayOfWeek(date) {
  return date.toLocaleString("en-US", { weekday: "long" });
}

// 🔍 Convert log type number to description
function getLogTypeDescription(logType) {
  switch (logType) {
    case 0:
      return "IN";
    case 1:
      return "OUT";
    case 4:
      return "LATE IN";
    case 5:
      return "LATE OUT";
    default:
      return "UNKNOWN";
  }
}

module.exports = processLogs;
