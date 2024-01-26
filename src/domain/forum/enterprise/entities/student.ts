import { Entity } from "@domain/core/entities/entity";

interface StudentProps {
  name: string;
}

export class Student extends Entity<StudentProps> {}
