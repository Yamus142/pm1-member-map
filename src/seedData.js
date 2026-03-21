// Seed 84 thành viên giả lập cho phòng Product Management 1
import seedMembers from './seed-members.json';

const KEY = 'vn_members';

export function seedIfEmpty() {
  const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (existing.length > 0) return false;

  localStorage.setItem(KEY, JSON.stringify(seedMembers));
  window.dispatchEvent(new Event('vn_members_changed'));
  return true;
}

export function resetAndSeed() {
  localStorage.setItem(KEY, JSON.stringify(seedMembers));
  window.dispatchEvent(new Event('vn_members_changed'));
}
