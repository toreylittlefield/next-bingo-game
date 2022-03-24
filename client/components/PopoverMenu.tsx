import {
  ButtonGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react';
import React from 'react';

type PopOverMenuProps = {
  buttonSubmit: React.ReactNode;
  buttonCancel: React.ReactNode;
  popOverBodyText?: string | React.ReactNode;
  children?: React.ReactNode;
  close: () => void;
  isOpen: boolean;
};

const defaultText = 'Are you sure you want to continue with your action?';

const PopoverMenu = ({
  buttonSubmit,
  popOverBodyText = defaultText,
  buttonCancel,
  isOpen,
  close,
  children,
}: PopOverMenuProps) => {
  return (
    <Popover
      returnFocusOnClose={false}
      offset={[0, 25]}
      isOpen={isOpen}
      onClose={close}
      closeOnEsc
      placement="auto"
      closeOnBlur={false}
      autoFocus
    >
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold">Confirmation</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody fontStyle={'italic'}>{popOverBodyText}</PopoverBody>
        <PopoverFooter d="flex" justifyContent="flex-end">
          <ButtonGroup size="lg">
            {buttonCancel}
            {buttonSubmit}
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export { PopoverMenu };
