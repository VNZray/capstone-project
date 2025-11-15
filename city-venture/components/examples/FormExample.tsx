import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Form } from '@/components/custom-ui/Form';
import { ThemedText } from '@/components/themed-text';
import { ChevronDownIcon, CheckIcon, CircleIcon } from 'lucide-react-native';

/**
 * Comprehensive Form Component Example
 * Demonstrates all Form compound components
 */
export default function FormExample() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);

  console.log('Selected:', selectedValue); // Demo: showing usage

  return (
    <ScrollView>
      <Form gap={20} padding={20}>
        <ThemedText.Heading size="xl">Form Examples</ThemedText.Heading>

        {/* Input Example */}
        <Form.Field>
          <Form.Field.Label>
            <Form.Field.LabelText>Email Address</Form.Field.LabelText>
          </Form.Field.Label>
          <Form.Input>
            <Form.Input.Field
              placeholder="Enter your email"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="email-address"
            />
          </Form.Input>
          <Form.Field.Helper>
            <Form.Field.HelperText>
              We&apos;ll never share your email.
            </Form.Field.HelperText>
          </Form.Field.Helper>
        </Form.Field>

        {/* Input with Icon */}
        <Form.Field>
          <Form.Field.Label>
            <Form.Field.LabelText>Password</Form.Field.LabelText>
          </Form.Field.Label>
          <Form.Input>
            <Form.Input.Field
              placeholder="Enter password"
              type="password"
              secureTextEntry
            />
            <Form.Input.Slot>
              <Form.Input.Icon as={CheckIcon} />
            </Form.Input.Slot>
          </Form.Input>
        </Form.Field>

        {/* Textarea Example */}
        <Form.Textarea.Field>
          <Form.Textarea.Field.Label>
            <Form.Textarea.Field.LabelText>Description</Form.Textarea.Field.LabelText>
          </Form.Textarea.Field.Label>
          <Form.Textarea>
            <Form.Textarea.Input
              placeholder="Enter description"
              value={textareaValue}
              onChangeText={setTextareaValue}
            />
          </Form.Textarea>
          <Form.Textarea.Field.Helper>
            <Form.Textarea.Field.HelperText>
              Maximum 500 characters
            </Form.Textarea.Field.HelperText>
          </Form.Textarea.Field.Helper>
        </Form.Textarea.Field>

        {/* Select Example */}
        <Form.Select.Field>
          <Form.Select.Field.Label>
            <Form.Select.Field.LabelText>Country</Form.Select.Field.LabelText>
          </Form.Select.Field.Label>
          <Form.Select onValueChange={setSelectedValue}>
            <Form.Select.Trigger>
              <Form.Select.Input placeholder="Select country" />
              <Form.Select.Icon as={ChevronDownIcon} />
            </Form.Select.Trigger>
            <Form.Select.Portal>
              <Form.Select.Backdrop />
              <Form.Select.Content>
                <Form.Select.DragIndicatorWrapper>
                  <Form.Select.DragIndicator />
                </Form.Select.DragIndicatorWrapper>
                <Form.Select.Item label="Philippines" value="ph" />
                <Form.Select.Item label="United States" value="us" />
                <Form.Select.Item label="Canada" value="ca" />
                <Form.Select.Item label="Japan" value="jp" />
              </Form.Select.Content>
            </Form.Select.Portal>
          </Form.Select>
        </Form.Select.Field>

        {/* Checkbox Example */}
        <Form.Field>
          <Form.Checkbox
            value="terms"
            isChecked={isChecked}
            onChange={setIsChecked}
          >
            <Form.Checkbox.Indicator>
              <Form.Checkbox.Icon as={CheckIcon} />
            </Form.Checkbox.Indicator>
            <Form.Checkbox.Label>
              I agree to the terms and conditions
            </Form.Checkbox.Label>
          </Form.Checkbox>
        </Form.Field>

        {/* Checkbox Group Example */}
        <Form.Field>
          <Form.Field.Label>
            <Form.Field.LabelText>Interests</Form.Field.LabelText>
          </Form.Field.Label>
          <Form.Checkbox.Group value={[]}>
            <Form.Checkbox value="sports">
              <Form.Checkbox.Indicator>
                <Form.Checkbox.Icon as={CheckIcon} />
              </Form.Checkbox.Indicator>
              <Form.Checkbox.Label>Sports</Form.Checkbox.Label>
            </Form.Checkbox>
            <Form.Checkbox value="music">
              <Form.Checkbox.Indicator>
                <Form.Checkbox.Icon as={CheckIcon} />
              </Form.Checkbox.Indicator>
              <Form.Checkbox.Label>Music</Form.Checkbox.Label>
            </Form.Checkbox>
            <Form.Checkbox value="travel">
              <Form.Checkbox.Indicator>
                <Form.Checkbox.Icon as={CheckIcon} />
              </Form.Checkbox.Indicator>
              <Form.Checkbox.Label>Travel</Form.Checkbox.Label>
            </Form.Checkbox>
          </Form.Checkbox.Group>
        </Form.Field>

        {/* Radio Example */}
        <Form.Field>
          <Form.Field.Label>
            <Form.Field.LabelText>Gender</Form.Field.LabelText>
          </Form.Field.Label>
          <Form.Radio.Group value={radioValue} onChange={setRadioValue}>
            <Form.Radio value="male">
              <Form.Radio.Indicator>
                <Form.Radio.Icon as={CircleIcon} />
              </Form.Radio.Indicator>
              <Form.Radio.Label>Male</Form.Radio.Label>
            </Form.Radio>
            <Form.Radio value="female">
              <Form.Radio.Indicator>
                <Form.Radio.Icon as={CircleIcon} />
              </Form.Radio.Indicator>
              <Form.Radio.Label>Female</Form.Radio.Label>
            </Form.Radio>
            <Form.Radio value="other">
              <Form.Radio.Indicator>
                <Form.Radio.Icon as={CircleIcon} />
              </Form.Radio.Indicator>
              <Form.Radio.Label>Other</Form.Radio.Label>
            </Form.Radio>
          </Form.Radio.Group>
        </Form.Field>

        {/* Switch Example */}
        <Form.Field>
          <Form.Field.Label>
            <Form.Field.LabelText>Notifications</Form.Field.LabelText>
          </Form.Field.Label>
          <Form.Switch
            value={switchValue}
            onValueChange={setSwitchValue}
          />
          <Form.Field.Helper>
            <Form.Field.HelperText>
              Enable push notifications
            </Form.Field.HelperText>
          </Form.Field.Helper>
        </Form.Field>

        {/* Error Example */}
        <Form.Field isInvalid>
          <Form.Field.Label>
            <Form.Field.LabelText>Username</Form.Field.LabelText>
          </Form.Field.Label>
          <Form.Input isInvalid>
            <Form.Input.Field placeholder="Enter username" />
          </Form.Input>
          <Form.Field.Error>
            <Form.Field.ErrorIcon as={CheckIcon} />
            <Form.Field.ErrorText>
              Username is already taken
            </Form.Field.ErrorText>
          </Form.Field.Error>
        </Form.Field>
      </Form>
    </ScrollView>
  );
}
