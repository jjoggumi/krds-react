import { env } from "@/supporters/migrations";
import { Timetables } from "../../../../../src/apis/Timetables";

class Hc2Timetables extends Timetables {
  constructor() {
    super({
      baseURL: env.BASE_API_URI,
    });
  }
}

export { Hc2Timetables };