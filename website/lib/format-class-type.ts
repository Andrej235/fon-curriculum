export function formatClassType(type: string): string {
  switch (type) {
    case "P":
      return "Predavanje";
    case "V":
      return "Vežbe";
    case "L":
      return "Laboratorijske Vežbe";
    default:
      return type;
  }
}
