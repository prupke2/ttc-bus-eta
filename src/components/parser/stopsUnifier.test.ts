import { expect, test } from "vitest";

import { mergeAndGroup } from "./stopsUnifier.js";

test.each([
  {
    title: "test array",
    input: [
      [1, 2, 3, 4, 5, 6, 7, 8],
      [-1, -2, -3, 1, 2, 3, 77, 76, 75],
      [9, 10, 1, 2, 3, 11, 12],
      [1, 2, 3],
    ],
    output: [
      [
        [-1, -2, -3],
        [9, 10],
      ],
      1,
      2,
      3,
      [
        [4, 5, 6, 7, 8],
        [77, 76, 75],
        [11, 12],
      ],
    ],
  },
  {
    title: "25 bus",
    input: [
      [
        14147, 3807, 6904, 1163, 7723, 279, 9720, 10195, 8954, 5504, 5214, 5186,
        3405, 5065, 278, 6399, 8040, 638,
      ],
      [
        14159, 6070, 9364, 2329, 5662, 5486, 24186, 7240, 8446, 613, 1197, 609,
        2900, 5132, 4580, 611, 937, 1049, 4777, 5763, 24108, 271, 280, 8401,
        8421, 4950, 4096, 1305, 3286, 5740, 2702, 6749, 8147, 4282, 3388, 9911,
        10280, 4017, 24367, 9779, 14147, 3807, 6904, 1163, 7723, 279, 9720,
        10195, 8954, 5504, 5214, 5186, 3405, 5065, 278, 6399, 8040, 638,
      ],
      [
        14828, 9010, 2882, 7079, 2386, 10280, 4017, 24367, 9779, 14147, 3807,
        6904, 1163, 7723, 279, 9720, 10195, 8954, 5504, 5214, 5186, 3405, 5065,
        278, 6399, 8040, 638,
      ],
    ],
    output: [
      [
        [
          14159, 6070, 9364, 2329, 5662, 5486, 24186, 7240, 8446, 613, 1197,
          609, 2900, 5132, 4580, 611, 937, 1049, 4777, 5763, 24108, 271, 280,
          8401, 8421, 4950, 4096, 1305, 3286, 5740, 2702, 6749, 8147, 4282,
          3388, 9911,
        ],
        [14828, 9010, 2882, 7079, 2386],
      ],
      10280,
      4017,
      24367,
      9779,
      14147,
      3807,
      6904,
      1163,
      7723,
      279,
      9720,
      10195,
      8954,
      5504,
      5214,
      5186,
      3405,
      5065,
      278,
      6399,
      8040,
      638,
    ],
  },
])("unify $title", ({ input, output }) => {
  expect(mergeAndGroup(...input)).toEqual(output);
});
