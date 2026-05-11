import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import ActionButton from '@/ui/ActionButton';

const ISSUE_TYPES = [
  'General Enquiry',
  'Report a Venue',
  'Report a Review',
  'Account Issue',
  'Suggest a Feature',
  'Bug Report',
  'Other',
];

const MESSAGE_MAX = 500;

interface FormData {
  issueType: string;
  email: string;
  message: string;
}

function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const messageValue = watch('message') ?? '';

  async function formSubmit(formData: FormData) {
    setStatus('submitting');
    try {
      const res = await fetch('https://formspree.io/f/xnjlyylp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          subject: formData.issueType,
          _replyto: formData.email,
          message: `From: ${formData.email}\n\n${formData.message}`,
        }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="flex w-full justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-xl border border-app-border bg-app-card p-6 shadow-md sm:p-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Contact Us</h1>
        <p className="mb-8 text-sm text-app-muted">
          Have a question, spotted an issue, or want to suggest something? We'd love to hear from you.
        </p>

        {status === 'success' ? (
          <div className="rounded-xl border border-success-200 bg-success-50 p-6 text-center dark:border-success-800 dark:bg-success-950/20">
            <p className="text-lg font-semibold text-success-700 dark:text-success-400">Message sent!</p>
            <p className="mt-1 text-sm text-success-600 dark:text-success-400">
              Thanks for getting in touch — we'll get back to you as soon as we can.
            </p>
            <div className="mt-5">
              <ActionButton intent="confirm" onPress={() => navigate('/')}>
                Back to Homepage
              </ActionButton>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit(formSubmit)}>
            <div className="flex flex-col gap-5">
              <Controller
                name="issueType"
                control={control}
                rules={{ required: 'Please select an issue type' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Issue Type"
                    labelPlacement="outside"
                    placeholder="Select an issue type"
                    radius="full"
                    variant="bordered"
                    selectedKeys={field.value ? new Set([field.value]) : new Set()}
                    onSelectionChange={(keys) => field.onChange([...keys][0])}
                    isInvalid={!!errors.issueType}
                    errorMessage={errors.issueType?.message}
                    classNames={{ label: 'text-md font-normal ml-1' }}
                  >
                    {ISSUE_TYPES.map((type) => (
                      <SelectItem key={type}>{type}</SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Please enter your email address',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    label="Your Email"
                    labelPlacement="outside"
                    placeholder="your@email.com"
                    radius="full"
                    variant="bordered"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    classNames={{ label: 'text-md font-normal ml-1' }}
                  />
                )}
              />

              <Controller
                name="message"
                control={control}
                rules={{
                  required: 'Please enter a message',
                  minLength: { value: 20, message: 'Message must be at least 20 characters' },
                  maxLength: { value: MESSAGE_MAX, message: `Message cannot exceed ${MESSAGE_MAX} characters` },
                }}
                render={({ field }) => (
                  <div>
                    <Textarea
                      {...field}
                      label="Message"
                      labelPlacement="outside"
                      placeholder="Tell us what's on your mind..."
                      radius="full"
                      variant="bordered"
                      rows={5}
                      isInvalid={!!errors.message}
                      errorMessage={errors.message?.message}
                      classNames={{ label: 'text-md font-normal ml-1' }}
                    />
                    <p className={`mt-1 text-right text-xs ${messageValue.length > MESSAGE_MAX ? 'text-danger' : 'text-app-muted'}`}>
                      {messageValue.length} / {MESSAGE_MAX}
                    </p>

                  </div>
                )}
              />

              {status === 'error' && (
                <p className="text-sm text-danger">
                  Something went wrong sending your message. Please try again.
                </p>
              )}

              <div className="flex justify-end">
                <ActionButton
                  intent="confirm"
                  type="submit"
                  isDisabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </ActionButton>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default Contact;
