import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  name: string;
  username: string;
  photoURL: string | null;
  title: string | null;
  company: string | null;
  brandName: string | null;
}

interface SearchableUserSelectProps {
  currentUserId: number;
  selectedUserId: number | null;
  onUserSelect: (userId: number | null) => void;
}

export function SearchableUserSelect({ currentUserId, selectedUserId, onUserSelect }: SearchableUserSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Search users as user types
  const { data: searchResults = [] } = useQuery<User[]>({
    queryKey: [`/api/users/search?q=${encodeURIComponent(searchQuery)}&currentUserId=${currentUserId}`],
    enabled: searchQuery.trim().length > 0,
  });

  // Reset when selectedUserId changes
  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      setSearchQuery("");
    }
  }, [selectedUserId]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchQuery("");
    setShowResults(false);
    onUserSelect(user.id);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchQuery("");
    onUserSelect(null);
  };

  const getDisplayTitle = (user: User) => {
    if (user.title && user.company) {
      return `${user.title} at ${user.company}`;
    }
    if (user.title) {
      return user.title;
    }
    if (user.company) {
      return user.company;
    }
    return user.username;
  };

  return (
    <div className="space-y-2">
      {/* Search Input or Selected User Display */}
      {!selectedUser ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="pl-10 bg-gray-800/80 text-white border-gray-700/50 focus:ring-white/10 focus:border-white/20 placeholder:text-gray-400"
          />
          
          {/* Search Results Dropdown */}
          {showResults && searchQuery.trim().length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="py-1">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={user.photoURL || undefined} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {user.name?.charAt(0) || user.username?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{user.name}</p>
                        <p className="text-gray-400 text-sm truncate">{getDisplayTitle(user)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-gray-400 text-sm">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Selected User Card */
        <div className="flex items-center gap-3 p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg">
          <Avatar className="h-12 w-12 border border-white/10">
            <AvatarImage src={selectedUser.photoURL || undefined} alt={selectedUser.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {selectedUser.name?.charAt(0) || selectedUser.username?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{selectedUser.name}</p>
            <p className="text-gray-400 text-sm truncate">{getDisplayTitle(selectedUser)}</p>
          </div>
          <button
            onClick={handleClearSelection}
            className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
