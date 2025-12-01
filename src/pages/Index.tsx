import { ControlPanel } from "@/components/VideoCreator/ControlPanel";
import { WorkflowSteps } from "@/components/VideoCreator/WorkflowSteps";
import { Header } from "@/components/VideoCreator/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ControlPanel />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto px-8 py-16">
            <section className="text-center space-y-8 mb-20">
              <h1 className="text-6xl font-bold leading-tight tracking-tight">
                FROM CONCEPT TO FINAL CUT<br />IN SECONDS
              </h1>
            </section>

            <section className="space-y-8 mb-20">
              <h2 className="text-4xl font-bold leading-tight">
                Control Every Camera Move
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl">
                Animate your scenes with precision and style. Get full cinematic control over how the camera moves to enhance emotion, rhythm, and storytelling.
              </p>
            </section>

            <WorkflowSteps />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
