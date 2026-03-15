export { Icon } from './Icon';
export type { IconProps } from './Icon';

// Common icon components using react-icons
import { FiUser, FiShoppingCart, FiSearch, FiMenu, FiX, FiChevronDown, FiChevronUp, FiChevronRight, FiChevronLeft, FiHome, FiBook, FiSettings, FiLogOut, FiEdit, FiTrash, FiPlus, FiMinus, FiCheck, FiAlertCircle, FiInfo, FiCheckCircle, FiXCircle, FiSun, FiMoon } from 'react-icons/fi';
import { Icon, IconProps } from './Icon';

// User Icons
export const UserIcon = (props: IconProps) => (
  <Icon {...props}><FiUser /></Icon>
);

export const CartIcon = (props: IconProps) => (
  <Icon {...props}><FiShoppingCart /></Icon>
);

// Navigation Icons
export const SearchIcon = (props: IconProps) => (
  <Icon {...props}><FiSearch /></Icon>
);

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}><FiMenu /></Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}><FiX /></Icon>
);

export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}><FiChevronDown /></Icon>
);

export const ChevronUpIcon = (props: IconProps) => (
  <Icon {...props}><FiChevronUp /></Icon>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}><FiChevronRight /></Icon>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}><FiChevronLeft /></Icon>
);

export const HomeIcon = (props: IconProps) => (
  <Icon {...props}><FiHome /></Icon>
);

export const BookIcon = (props: IconProps) => (
  <Icon {...props}><FiBook /></Icon>
);

// Action Icons
export const SettingsIcon = (props: IconProps) => (
  <Icon {...props}><FiSettings /></Icon>
);

export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}><FiLogOut /></Icon>
);

export const EditIcon = (props: IconProps) => (
  <Icon {...props}><FiEdit /></Icon>
);

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}><FiTrash /></Icon>
);

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}><FiPlus /></Icon>
);

export const MinusIcon = (props: IconProps) => (
  <Icon {...props}><FiMinus /></Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}><FiCheck /></Icon>
);

// Status Icons
export const AlertIcon = (props: IconProps) => (
  <Icon {...props}><FiAlertCircle /></Icon>
);

export const InfoIcon = (props: IconProps) => (
  <Icon {...props}><FiInfo /></Icon>
);

export const SuccessIcon = (props: IconProps) => (
  <Icon {...props}><FiCheckCircle /></Icon>
);

export const ErrorIcon = (props: IconProps) => (
  <Icon {...props}><FiXCircle /></Icon>
);

export const SunIcon = (props: IconProps) => (
  <Icon {...props}><FiSun /></Icon>
);

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}><FiMoon /></Icon>
);
