import { Component } from "react";
import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { RotateCw } from "lucide-react";

/**
 * Keeps a render error inside one part of the page.
 *
 * The app's other boundary (`ErrorBoundary`) is the router's `errorElement`: it only runs for
 * errors React Router itself catches, and it replaces the whole screen. A cell that throws on
 * unexpected data would take the entire app down with it, so the parts that render
 * backend-defined content wrap themselves in this one instead.
 *
 * `resetKey` clears the error when the caller moves on (another tab, another country), so a
 * bad record does not keep the section broken.
 */
class ComponentErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error, info) {
    console.error("Component render error:", error, info?.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    const { children, title, description, retryLabel } = this.props;
    if (!error) return children;

    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            retryLabel ? (
              <Button
                color="inherit"
                size="small"
                onClick={this.handleRetry}
                startIcon={<RotateCw size={14} />}
              >
                {retryLabel}
              </Button>
            ) : null
          }
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {description}
        </Alert>
      </Box>
    );
  }
}

export default ComponentErrorBoundary;
