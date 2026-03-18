export function formatGroupNames(groupNames: string[]): string {
  const groups = groupNames.map((name) => name.replace("A", ""));
  if (groups.length === 1) return `Grupa ${groups[0]}`;
  return `Grupe ${formatNumberArray(groups.map(Number))}`;

  function formatNumberArray(nums: number[]): string {
    if (nums.length <= 4) {
      return nums.join(", ");
    }

    const ranges: string[] = [];
    let start = nums[0];
    let prev = nums[0];

    for (let i = 1; i <= nums.length; i++) {
      const curr = nums[i];

      // If break in sequence, push a range
      if (curr !== prev + 1) {
        if (start === prev) {
          ranges.push(`${start}`);
        } else {
          ranges.push(`${start}-${prev}`);
        }
        start = curr;
      }

      prev = curr;
    }

    return ranges.join(", ");
  }
}
