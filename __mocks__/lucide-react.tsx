/**
 * Mock lucide-react for Jest tests
 * Returns proper React components
 */
import React from 'react';

// Create a generic mock icon component
const createMockIcon = (displayName: string) => {
  const MockIcon = React.forwardRef<
    SVGSVGElement,
    React.SVGProps<SVGSVGElement>
  >((props, ref) => (
    <svg
      ref={ref}
      data-testid={`${displayName.toLowerCase()}-icon`}
      data-icon={displayName}
      {...props}
    />
  ));
  MockIcon.displayName = displayName;
  return MockIcon;
};

// Export all commonly used icons
export const AlertCircle = createMockIcon('AlertCircle');
export const AlertTriangle = createMockIcon('AlertTriangle');
export const CheckCircle = createMockIcon('CheckCircle');
export const CheckCircle2 = createMockIcon('CheckCircle2');
export const XCircle = createMockIcon('XCircle');
export const X = createMockIcon('X');
export const Info = createMockIcon('Info');
export const HelpCircle = createMockIcon('HelpCircle');

// Navigation
export const Home = createMockIcon('Home');
export const Menu = createMockIcon('Menu');
export const ChevronRight = createMockIcon('ChevronRight');
export const ChevronLeft = createMockIcon('ChevronLeft');
export const ChevronDown = createMockIcon('ChevronDown');
export const ChevronUp = createMockIcon('ChevronUp');
export const ArrowUpRight = createMockIcon('ArrowUpRight');
export const ArrowDownRight = createMockIcon('ArrowDownRight');
export const ExternalLink = createMockIcon('ExternalLink');

// Wallet & Finance
export const Wallet = createMockIcon('Wallet');
export const DollarSign = createMockIcon('DollarSign');
export const CreditCard = createMockIcon('CreditCard');
export const Banknote = createMockIcon('Banknote');
export const Receipt = createMockIcon('Receipt');
export const TrendingUp = createMockIcon('TrendingUp');
export const TrendingDown = createMockIcon('TrendingDown');
export const Activity = createMockIcon('Activity');
export const BarChart = createMockIcon('BarChart');
export const PieChart = createMockIcon('PieChart');
export const LineChart = createMockIcon('LineChart');

// Actions
export const Download = createMockIcon('Download');
export const Upload = createMockIcon('Upload');
export const Send = createMockIcon('Send');
export const RefreshCw = createMockIcon('RefreshCw');
export const Plus = createMockIcon('Plus');
export const Minus = createMockIcon('Minus');
export const Edit = createMockIcon('Edit');
export const Trash = createMockIcon('Trash');
export const Copy = createMockIcon('Copy');
export const Share = createMockIcon('Share');
export const Save = createMockIcon('Save');

// Time & Calendar
export const Clock = createMockIcon('Clock');
export const Calendar = createMockIcon('Calendar');

// User & Profile
export const User = createMockIcon('User');
export const Users = createMockIcon('Users');
export const UserPlus = createMockIcon('UserPlus');
export const UserMinus = createMockIcon('UserMinus');
export const LogIn = createMockIcon('LogIn');
export const LogOut = createMockIcon('LogOut');

// Communication
export const Bell = createMockIcon('Bell');
export const Mail = createMockIcon('Mail');
export const MessageSquare = createMockIcon('MessageSquare');
export const Phone = createMockIcon('Phone');

// Content
export const FileText = createMockIcon('FileText');
export const File = createMockIcon('File');
export const Folder = createMockIcon('Folder');
export const Image = createMockIcon('Image');
export const Video = createMockIcon('Video');

// UI
export const Search = createMockIcon('Search');
export const Filter = createMockIcon('Filter');
export const Settings = createMockIcon('Settings');
export const MoreVertical = createMockIcon('MoreVertical');
export const MoreHorizontal = createMockIcon('MoreHorizontal');
export const Eye = createMockIcon('Eye');
export const EyeOff = createMockIcon('EyeOff');
export const Heart = createMockIcon('Heart');
export const Star = createMockIcon('Star');
export const Check = createMockIcon('Check');

// Loading
export const Loader = createMockIcon('Loader');
export const Loader2 = createMockIcon('Loader2');

// Commerce
export const Package = createMockIcon('Package');
export const ShoppingCart = createMockIcon('ShoppingCart');
export const ShoppingBag = createMockIcon('ShoppingBag');
