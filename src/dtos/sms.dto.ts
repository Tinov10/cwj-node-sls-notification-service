import { IsString } from 'class-validator';

export class SMSInput {
  @IsString()
  phone: string;

  @IsString()
  code: string;
}
