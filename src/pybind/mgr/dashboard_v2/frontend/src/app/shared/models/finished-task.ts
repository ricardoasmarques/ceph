import { Task } from './task';

export class FinishedTask extends Task {
  begin_time: number;
  end_time: number;
  exception: string;
  latency: number;
  progress: number;
  ret_value: any;
  success: boolean;

  errorMessage: string;
}
