import { useUnits } from "../hooks/useUnits";
import { unitSymbol } from "../utils/temperature";

export function UnitToggle() {
  const { unit, toggleUnit } = useUnits();

  return (
    <button
      type="button"
      className="unit-toggle"
      onClick={toggleUnit}
      aria-label={`Switch to ${unit === "celsius" ? "Fahrenheit" : "Celsius"}`}
      title={`Display: ${unitSymbol(unit)}`}
    >
      {unitSymbol(unit)}
    </button>
  );
}
