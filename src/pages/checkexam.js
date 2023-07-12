import * as React from "react";
import Head from "next/head";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
} from "@mui/material";
import { useRouter } from "next/router";
import { Box } from "@mui/system";

export default function CheckExam() {
  const [id, setId] = React.useState("0");
  const [exams, setExams] = React.useState([]);
  const [results, setResults] = React.useState([]);
  const [info, setInfo] = React.useState("");
  const [optsLoading, setOptsLoading] = React.useState(true);
  const router = useRouter();
  React.useEffect(() => {
    let suffix = sessionStorage.getItem("suffix");
    let session = sessionStorage.getItem("session");
    if (!suffix || !session) {
      setInfo("Session expired. Please login again.");
      router.push("/");
    }
    fetch(
      `https://isp-cf-workers.dabby.workers.dev/authcheck?session=${session}&sess_suffix=${suffix}`
    ).then((resp) => {
      if (resp.status !== 200) {
        setInfo("Session expired. Please login again.");
        sessionStorage.clear();
        router.push("/");
      }
    });
    checkExam();
    setOptsLoading(false);
  }, []);

  async function checkExam() {
    let suffix = sessionStorage.getItem("suffix");
    let session = sessionStorage.getItem("session");
    if (!suffix || !session) {
      sessionStorage.clear();
      router.push("/");
    }
    let resp = await fetch(
      `http://isp-cf-workers.dabby.workers.dev/examcheck?session=${session}&sess_suffix=${suffix}&id=${id}`
    ).catch((e) => {
      setInfo("Error fetching attendance data.");
    });

    switch (resp.status) {
      case 401:
        setInfo("Session expired. Please login again.");
        sessionStorage.clear();
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
    setExams(data.exams);
    setResults(data.exam_results);
  }
  const columns = [
    {
      field: "subject",
      headerName: "Subject",
      flex: 1,
    },
    {
      field: "mark",
      headerName: "Mark",
      flex: 1,
    },
    {
      field: "grade",
      headerName: "Grade",
      flex: 1,
    },
  ];
  return (
    <>
      <Head>
        <title>Check Exam Results</title>
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
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button href="/checkattd">Attendance</Button>
            <Button href="/checkexam">Exam Results</Button>
          </Stack>
          <h1>Check Exam Results</h1>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel id="exam-selector-label">Select Exam</InputLabel>
              <Select
                labelId="exam-selector-label"
                id="exam-selector"
                value={id}
                label="Select Exam"
                onChange={(e) => {
                  setId(e.target.value);
                }}
              >
                {exams.map((exam) => (
                  <MenuItem key={exam.exam_id} value={exam.exam_id}>
                    {exam.exam_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={checkExam}>
              Check Exam Results
            </Button>
            <Box sx={{ width: "100%" }}>
              <DataGrid
                getRowId={(row) => row.subject}
                rows={results}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                autoHeight
              />
            </Box>
          </Stack>
        </Box>
      </main>
    </>
  );
}
