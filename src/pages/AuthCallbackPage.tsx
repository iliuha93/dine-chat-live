import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error.message);
        navigate("/login?error=auth_failed", { replace: true });
        return;
      }

      if (data.session) {
        navigate("/chat", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background overflow-hidden">
      <div className="ambient-orb w-72 h-72 bg-primary top-[-5%] left-[-10%]" />
      <div className="ambient-orb w-96 h-96 bg-primary bottom-[-15%] right-[-15%]" />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-up">
        <img
          src="/Liechtensteinhaus_Logo.png"
          alt="Liechtensteinhaus"
          className="w-20 h-20 object-contain drop-shadow-xl"
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">Завершаем вход...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
