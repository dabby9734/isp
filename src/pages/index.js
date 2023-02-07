import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Snackbar,
  Stack,
  TextField,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import LoginIcon from "@mui/icons-material/Login";

export default function LoginPage() {
  const router = useRouter();
  const [info, setInfo] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rem, setRem] = useState(false);
  const [loading, setLoading] = useState(false);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const loginUser = async () => {
    setLoading(true);
    const resp = await fetch(
      `https://isp-cf-workers.dabby.workers.dev/login?id=${encodeURIComponent(
        username
      )}&pw=${encodeURIComponent(password)}`
    );
    if (resp.ok) {
      const data = await resp.json();
      sessionStorage.setItem("session", data.session);
      router.push("/checkattd");
    } else {
      setInfo("Incorrect username or password.");
    }
    setLoading(false);
  };

  return (
    <div>
      <Head>
        <title>Attendance Checker :: Login</title>
        <meta name="description" content="i-EMB, reimagined." />
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
      <div className="login-bg">
        <div className="login">
          <div className="login__hero">
            <p className="login__hero__main-text">ISP</p>
            <p className="login__hero__description">the wheel, reinvented.</p>
          </div>
          <div className="login__content-bg">
            <div className="login__content-wrapper">
              <div className="login__content">
                <h1>Login</h1>
                <ThemeProvider theme={darkTheme}>
                  <Stack spacing={2} component="form">
                    <TextField
                      id="username"
                      label="Username"
                      variant="outlined"
                      onChange={(e) => {
                        setUsername(e.target.value);
                      }}
                      autoComplete="username"
                    />
                    <TextField
                      id="password"
                      label="Password"
                      variant="outlined"
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      type="password"
                      autoComplete="current-password"
                    />
                    <div className="login-button-right-align">
                      <FormGroup>
                        <FormControlLabel
                          disabled
                          control={<Checkbox />}
                          label="Remember Me"
                          sx={{
                            color: "text.secondary",
                            paddingLeft: "1rem",
                          }}
                          onChange={(e) => {
                            setRem(e.target.checked);
                          }}
                        />
                      </FormGroup>
                      <LoadingButton
                        variant="contained"
                        type="submit"
                        onClick={loginUser}
                        endIcon={<LoginIcon />}
                        loading={loading}
                        loadingPosition="end"
                        sx={{ maxWidth: "8rem", textTransform: "none" }}
                      >
                        Login
                      </LoadingButton>
                    </div>
                  </Stack>
                </ThemeProvider>

                <div className="login__content-links">
                  <p>
                    Thank you for using this service :D Do also check out{" "}
                    <a className="underline" href="https://iemb.pages.dev">
                      iEMB
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
