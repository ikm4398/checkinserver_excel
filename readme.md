

### ✅ Project Setup Steps

1. **`.env` file**:
   ```env
   PORT=3000
   USR=administrator
   PWD=admin
   API_URL=http://erpdemo.deskgoo.com
   ```

2. **Data Folder Structure**:
   ```
   data/
   ├── devicelog.xlsx     # Contains device_id, time_stamp, log_type
   └── employeeMap.json   # Maps device_id to employee
   ```

3. **Run server**:
   ```bash
   node server.js
   ```

4. **Hit API to process logs**:
   Visit or use cURL/postman:
   ```bash
   curl http://127.0.0.1:3000/process-logs
   ```
   This generates:
   ```
   data/checkinlog.json
   ```

5. **Post the check-in log to ERPNext**:
   Open a second terminal and run:
   ```bash
   node postData.js
   ```
