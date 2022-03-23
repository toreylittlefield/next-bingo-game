// import yup from '../../types/yup-extend';
import * as yup from 'yup';
import { AnyObject, Maybe } from 'yup/lib/types';
const { addMethod, mixed, object, string, date, array } = yup;
declare module 'yup' {
  interface DateSchema<
    TType extends Maybe<Date> = Date | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType,
  > extends yup.BaseSchema<TType, TContext, TOut> {
    isDayDiffGT120(message: string): DateSchema<TType, TContext>;
  }
}

addMethod(mixed, 'isDayDiffGT120', function (message: string) {
  return this.test('isDayDiffGT120', message, function (value) {
    if (value === false) return true;
    const todayDate = new Date();
    const diffDays = (todayDate.getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 120;
  });
});

export const updateUserYupSchemaBackend = object().shape({
  name: string().min(3).max(30).required(),
  alias: string().min(3).max(30).required(),
  // icon: string().url().required(),
  access_token: string().required(),
  lastUpdated: date().isDayDiffGT120('Day difference between dates must be >= 120 days').required(),
});

export const updateUserYupSchemaFrontend = object().shape({
  name: string().min(3).max(30).required(),
  alias: string().min(3).max(30).required(),
  icon: string().required(),
  lastUpdated: date().isDayDiffGT120('Day difference between dates must be >= 120 days').required(),
});

export const createBoardYupSchema = object()
  .strict(true)
  .shape({
    board: array().of(string().min(1).max(100)).length(25).required(),
    title: string().min(3).max(50).required(),
  });
