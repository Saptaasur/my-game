// src/utils/physics.ts

/**
 * Calculates the distance between two points in 3D space.
 * @param p1 - The first point as [x, y, z].
 * @param p2 - The second point as [x, y, z].
 * @returns The distance between the two points.
 */
export function distanceBetweenPoints(p1: [number, number, number], p2: [number, number, number]): number {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const dz = p2[2] - p1[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Checks if two objects are colliding based on their bounding boxes.
   * @param a - The bounding box of the first object.
   * @param b - The bounding box of the second object.
   * @returns True if the objects are colliding, otherwise false.
   */
  export function checkCollision(a: { min: [number, number, number]; max: [number, number, number] },
                                 b: { min: [number, number, number]; max: [number, number, number] }): boolean {
    return (a.min[0] <= b.max[0] && a.max[0] >= b.min[0]) &&
           (a.min[1] <= b.max[1] && a.max[1] >= b.min[1]) &&
           (a.min[2] <= b.max[2] && a.max[2] >= b.min[2]);
  }
  