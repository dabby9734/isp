import * as React from "react";
import Head from "next/head";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DataGrid } from "@mui/x-data-grid";
import { Alert, TextField, Snackbar, Stack, Button } from "@mui/material";
import moment from "moment";
import { useRouter } from "next/router";
import { Box } from "@mui/system";

export default function Home() {
  const [startDate, setStartDate] = React.useState(
    moment().subtract(7, "days")
  );
  const [endDate, setEndDate] = React.useState(moment());
  const [info, setInfo] = React.useState("");
  const [attendance, setAttendance] = React.useState([]);
  const router = useRouter();
  async function checkAttd() {
    let suffix = sessionStorage.getItem("suffix");
    let session = sessionStorage.getItem("session");
    if (!suffix || !session) {
      router.push("/");
    }
    let resp = await fetch(
      `https://isp-cf-workers.dabby.workers.dev/attendance?session=${session}&sess_suffix=${suffix}&start=${startDate.format(
        "YYYY-MM-DD"
      )}&end=${endDate.format("YYYY-MM-DD")}&rankby=date&status=1,5,15,10,14`
    ).catch((e) => {
      setInfo("Error fetching attendance data.");
    });

    switch (resp.status) {
      case 401:
        setInfo("Session expired. Please login again.");
        localStorage.removeItem("session");
        router.push("/");
        return;
      case 400:
        setInfo("Invalid request.");
        return;
      case 500:
        setInfo("Internal server error.");
        return;
      case 200:
        break;
    }

    let data = await resp.json();
    setAttendance(data);
  }
  const columns = [
    {
      field: "pretty_date",
      headerName: "Date",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "updated_by",
      headerName: "Updated By",
      flex: 1,
    },
  ];
  return (
    <>
      <Head>
        <title>Check Attendance</title>
        <meta name="description" content="Check your attendance here" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar
        open={!!info}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setInfo("")}
      >
        <Alert severity="info">{info}</Alert>
      </Snackbar>
      <main>
        <Box
          sx={{
            padding: "2rem",
          }}
        >
          <h1>Check Attendance</h1>
          <Stack spacing={3}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => {
                setStartDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => {
                console.log(newValue);
                setEndDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <Button variant="contained" onClick={checkAttd}>
              Check Attendance
            </Button>
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                getRowId={(row) => row.date}
                rows={attendance}
                columns={columns}
                pageSize={20}
                rowsPerPageOptions={[5]}
              />
            </Box>
          </Stack>
        </Box>
      </main>
    </>
  );
}
