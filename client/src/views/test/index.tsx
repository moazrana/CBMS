import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tabs } from '../../components/Tabs/Tabs';
import Input from '../../components/input/Input';
import Layout from '../../layouts/layout';

const TestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [inputValue, setInputValue] = useState('');
  
  // Focus restoration logic (similar to staff edit page)
  const focusedInputRef = useRef<{ name: string; selectionStart: number | null } | null>(null);
  
  const saveFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    focusedInputRef.current = {
      name: input.name,
      selectionStart: input.selectionStart,
    };
  }, []);
  
  // Restore focus after render
  useEffect(() => {
    if (focusedInputRef.current) {
      const input = document.querySelector(`input[name="${focusedInputRef.current.name}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        if (focusedInputRef.current.selectionStart !== null) {
          input.setSelectionRange(focusedInputRef.current.selectionStart, focusedInputRef.current.selectionStart);
        }
      }
    }
  });
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);
  
  const tabs = [
    {
      id: 'tab1',
      label: 'Tab 1',
      content: (
        <div style={{ padding: '20px' }}>
          <Input
            label="Test Input"
            name="testInput"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={saveFocus}
          />
          <p>Type in the input above. Does it lose focus after typing one character?</p>
        </div>
      ),
    },
    {
      id: 'tab2',
      label: 'Tab 2',
      content: (
        <div style={{ padding: '20px' }}>
          <p>This is tab 2 content</p>
        </div>
      ),
    },
  ];
  
  return (
    <Layout>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </Layout>
  );
};

export default TestPage;

