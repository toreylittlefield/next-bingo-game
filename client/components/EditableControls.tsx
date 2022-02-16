import { useEditableControls, ButtonGroup, IconButton, Flex } from '@chakra-ui/react';
import {
  AiOutlineCheckCircle as CheckIcon,
  AiOutlineCloseCircle as CloseIcon,
  AiOutlineEdit as EditIcon,
} from 'react-icons/ai';

const EditableControls = () => {
  const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = useEditableControls();

  return isEditing ? (
    <ButtonGroup justifyContent="center" size="sm">
      <IconButton aria-label="open" icon={<CheckIcon />} {...getSubmitButtonProps()} />
      <IconButton aria-label="close" icon={<CloseIcon />} {...getCancelButtonProps()} />
    </ButtonGroup>
  ) : (
    <Flex justifyContent="center">
      <IconButton aria-label="edit" size="sm" icon={<EditIcon />} {...getEditButtonProps()} />
    </Flex>
  );
};

export default EditableControls;
