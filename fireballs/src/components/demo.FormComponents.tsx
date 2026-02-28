import { useStore } from '@tanstack/react-form';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import * as ShadcnSelect from '@/src/components/ui/select';
import { Slider as ShadcnSlider } from '@/src/components/ui/slider';
import { Switch as ShadcnSwitch } from '@/src/components/ui/switch';
import { Textarea as ShadcnTextarea } from '@/src/components/ui/textarea';
import { useFieldContext, useFormContext } from '@/src/hooks/demo.form-context';

export const Select = ({
  label,
  placeholder,
  values,
}: {
  label: string;
  placeholder?: string;
  values: Array<{ label: string; value: string }>;
}) => {
  const field = useFieldContext<string>();
  const errors = useStore(
    field.store,
    (state) => state.meta.errors as Array<string | { message: string }>,
  );

  return (
    <div>
      <ShadcnSelect.Select
        name={field.name}
        onValueChange={(value) => field.handleChange(value)}
        value={field.state.value}
      >
        <ShadcnSelect.SelectTrigger className='w-full'>
          <ShadcnSelect.SelectValue placeholder={placeholder} />
        </ShadcnSelect.SelectTrigger>
        <ShadcnSelect.SelectContent className='bg-background text-foreground'>
          <ShadcnSelect.SelectGroup>
            <ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
            {values.map((value) => (
              <ShadcnSelect.SelectItem
                className='text-foreground'
                key={value.value}
                value={value.value}
              >
                {value.label}
              </ShadcnSelect.SelectItem>
            ))}
          </ShadcnSelect.SelectGroup>
        </ShadcnSelect.SelectContent>
      </ShadcnSelect.Select>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
};

export const Slider = ({ label }: { label: string }) => {
  const field = useFieldContext<number>();
  const errors = useStore(
    field.store,
    (state) => state.meta.errors as Array<string | { message: string }>,
  );

  return (
    <div>
      <Label className='mb-2 text-xl font-bold' htmlFor={label}>
        {label}
      </Label>
      <ShadcnSlider
        id={label}
        onBlur={field.handleBlur}
        onValueChange={(value) => field.handleChange(value[0])}
        value={[field.state.value]}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
};

export const SubscribeButton = ({ label }: { label: string }) => {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button disabled={isSubmitting} type='submit'>
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
};

export const Switch = ({ label }: { label: string }) => {
  const field = useFieldContext<boolean>();
  const errors = useStore(
    field.store,
    (state) => state.meta.errors as Array<string | { message: string }>,
  );

  return (
    <div>
      <div className='flex items-center gap-2'>
        <ShadcnSwitch
          checked={field.state.value}
          id={label}
          onBlur={field.handleBlur}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
        <Label htmlFor={label}>{label}</Label>
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
};

export const TextArea = ({
  label,
  rows = 3,
}: {
  label: string;
  rows?: number;
}) => {
  const field = useFieldContext<string>();
  const errors = useStore(
    field.store,
    (state) => state.meta.errors as Array<string | { message: string }>,
  );

  return (
    <div>
      <Label className='mb-2 text-xl font-bold' htmlFor={label}>
        {label}
      </Label>
      <ShadcnTextarea
        id={label}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        rows={rows}
        value={field.state.value}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
};

export const TextField = ({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) => {
  const field = useFieldContext<string>();
  const errors = useStore(
    field.store,
    (state) => state.meta.errors as Array<string | { message: string }>,
  );

  return (
    <div>
      <Label className='mb-2 text-xl font-bold' htmlFor={label}>
        {label}
      </Label>
      <Input
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        value={field.state.value}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
};

const ErrorMessages = ({
  errors,
}: {
  errors: Array<string | { message: string }>;
}) => (
  <>
    {errors.map((error) => (
      <div
        className='mt-1 font-bold text-red-500'
        key={typeof error === `string` ? error : error.message}
      >
        {typeof error === `string` ? error : error.message}
      </div>
    ))}
  </>
);
