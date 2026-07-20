import { useRouter, useRouterState } from "@tanstack/react-router";
import { Component, type ErrorInfo, type ReactNode, useEffect } from "react";

import { useToast } from "@/app/providers/toastProvider";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/emptyState";
import { ScroogeArt } from "@/shared/ui/scroogeArt";

interface IErrorBoundaryProps {
  children: ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
}

interface IRecoverProps {
  onReset: () => void;
}

const RecoverToLedger = ({ onReset }: IRecoverProps) => {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { showToast } = useToast();
  const isLedger = pathname === "/";

  useEffect(() => {
    if (isLedger) return;

    showToast("Что-то пошло не так. Вернули в журнал.", "error");
    void router.navigate({ to: "/" }).then(onReset);
  }, [isLedger, onReset, router, showToast]);

  if (isLedger) {
    return (
      <EmptyState
        action={
          <Button onClick={() => window.location.reload()} type="button">
            Обновить
          </Button>
        }
        description="Попробуйте обновить страницу или вернитесь позже"
        title="Что-то пошло не так"
      >
        <ScroogeArt animate={false} size="lg" variant="cute" />
      </EmptyState>
    );
  }

  return null;
};

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  state: IErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): IErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <RecoverToLedger onReset={this.reset} />;
    }

    return this.props.children;
  }
}
