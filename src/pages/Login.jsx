import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";

const { Title, Text } = Typography;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleCredentialsSubmit = async (values) => {
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await API.post("/login", {
        email: values.email,
        password: values.password,
      });

      console.log("Login response:", res.data);

      // If token is present, login is successful
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/", { replace: true });
        return;
      }

      // If OTP is required or sent, move to OTP step
      if (res.data.otpRequired || res.data.otpSent || res.data.success) {
        setEmail(values.email);
        setPassword(values.password);
        setStep("otp");
        setInfo("A 5-digit verification code has been sent to your inbox. Please enter it below.");
        return;
      }

      // Fallback: if we got a 2xx response but no token and no explicit error, assume OTP step
      if (res.status === 200) {
        setEmail(values.email);
        setPassword(values.password);
        setStep("otp");
        setInfo("A 5-digit verification code has been sent to your inbox. Please enter it below.");
        return;
      }

      setError("Login failed. Please try again.");
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setError(err.response?.data?.message || "Unable to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await API.post("/verify-otp", {
        email,
        otp,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/", { replace: true });
        return;
      }

      setError("OTP verification failed. Please check the code and try again.");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 380, borderRadius: 16 }} bodyStyle={{ padding: 32 }} bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ margin: 0, marginBottom: 4,color: "#fa5252" }}>
              Babli & Jitendra's Gallery
            </Title>
            <Text type="secondary">Enter your credentials and verify your login with OTP.</Text>
          </div>

          {error && <Alert type="error" message={error} showIcon />}
          {info && <Alert type="info" message={info} showIcon />}

          {step === "credentials" ? (
            <Form
              layout="vertical"
              name="loginForm"
              onFinish={handleCredentialsSubmit}
              initialValues={{ email, password }}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter your email." },
                  { type: "email", message: "Enter a valid email." },
                ]}
              >
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please enter your password." }]}
              >
                <Input.Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </Form.Item>

              <Form.Item>
                <Button style={{backgroundColor:'#f03e3e'}} type="primary" htmlType="submit" block loading={loading}>
                  Continue
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Text type="secondary">Enter the 6-digit code from your email</Text>
              </div>
              <Form layout="vertical" name="otpForm">
                <Form.Item label="Verification Code" required>
                  <Input
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(val);
                    }}
                    placeholder="000000"
                    maxLength={6}
                    style={{
                      fontSize: 24,
                      letterSpacing: 12,
                      fontWeight: "bold",
                      textAlign: "center",
                      padding: "12px",
                    }}
                  />
                </Form.Item>
              </Form>

              <Button style={{backgroundColor:'#f03e3e'}} type="primary" block onClick={handleOtpSubmit} loading={loading} size="large">
                Verify OTP
              </Button>

              <Button block type="default" onClick={() => {setStep("credentials"); setOtp("");}}> 
                Back to Login
              </Button>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
}

export default Login;
