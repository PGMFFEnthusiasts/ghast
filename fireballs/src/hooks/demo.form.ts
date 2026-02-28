import { createFormHook } from '@tanstack/react-form';

import {
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '@/src/components/demo.FormComponents';
import { fieldContext, formContext } from '@/src/hooks/demo.form-context';

export const { useAppForm } = createFormHook({
  fieldComponents: {
    Select,
    TextArea,
    TextField,
  },
  fieldContext,
  formComponents: {
    SubscribeButton,
  },
  formContext,
});
