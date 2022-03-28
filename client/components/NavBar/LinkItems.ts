import { IconType } from 'react-icons';
import { FiGrid, FiHome, FiPlay, FiSquare } from 'react-icons/fi';

interface LinkItemProps {
  name: string;
  icon: IconType;
  href: string;
}
export const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Rooms', href: '/', icon: FiGrid },
  { name: 'Boards', href: '/', icon: FiSquare },
  { name: 'Play', href: '/', icon: FiPlay },
];
