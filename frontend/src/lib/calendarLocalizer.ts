import { momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/ru'

moment.locale('ru')

export const localizer = momentLocalizer(moment)
//