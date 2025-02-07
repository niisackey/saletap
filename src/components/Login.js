import React, { useState } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Card, 
  CardContent, 
  InputAdornment,
  IconButton 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { saveToken, saveRole } from "../utils/authUtils";
import { Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { access_token, role } = await login(username, password);
      saveToken(access_token);
      saveRole(role);

      // Changed from "Store Owner" to "Admin"
      if (role === "Admin") {
        navigate("/dashboard");
      } else {
        setError("Unauthorized: You do not have access to this application.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card 
        sx={{
          width: '100%',
          maxWidth: 450,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          bgcolor: 'background.paper'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3,
              fontWeight: 700,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome Back
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider'
                }
              }
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider'
                }
              }
            }}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: 16,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                opacity: 0.9,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;