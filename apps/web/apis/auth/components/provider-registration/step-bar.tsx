import { providerRegistrationSteps } from "../../constants/provider-registration";

export function ProviderRegistrationStepBar({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3">
      {providerRegistrationSteps.map((item, index) => {
        const active = item.id === currentStep;
        const complete = item.id < currentStep;

        return (
          <div key={item.id} className="relative text-center">
            {index > 0 && (
              <span
                className={`absolute right-1/2 top-5 h-0.5 w-full ${
                  active || complete ? "bg-brand" : "bg-border-subtle"
                }`}
              />
            )}
            <span
              className={`relative z-10 mx-auto grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold ${
                active || complete
                  ? "border-brand bg-brand text-white"
                  : "border-surface-soft bg-surface-soft text-muted"
              }`}
            >
              {complete ? "✓" : item.id}
            </span>
            <p
              className={`mt-2 text-sm font-bold ${
                active ? "text-brand" : "text-muted"
              }`}
            >
              {item.label}
            </p>
            <p className="mx-auto mt-1 hidden max-w-40 text-xs leading-5 text-muted sm:block">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
