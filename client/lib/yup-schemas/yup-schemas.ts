// import yup from '../../types/yup-extend';
import * as yup from 'yup';
import { AnyObject, Maybe } from 'yup/lib/types';

declare module 'yup' {
  interface DateSchema<
    TType extends Maybe<Date> = Date | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType,
  > extends yup.BaseSchema<TType, TContext, TOut> {
    isDayDiffGT120(message: string): DateSchema<TType, TContext>;
  }
}

const { addMethod, mixed, object, string, date } = yup;

addMethod(mixed, 'isDayDiffGT120', function (message: string) {
  return this.test('isDayDiffGT120', message, function (value) {
    if (value === false) return true;
    const todayDate = new Date();
    const diffDays = (todayDate.getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 120;
  });
});

export const updateUserYupSchema = object().shape({
  user: string().min(3).max(30).required(),
  alias: string().min(3).max(20).required(),
  icon: string().url().required(),
  access_token: string().required(),
  lastUpdated: date().isDayDiffGT120('Day difference between dates must be >= 120 days').required(),
});
