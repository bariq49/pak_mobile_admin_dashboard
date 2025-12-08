"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useUpdateProfileMutation } from "@/hooks/api/use-auth-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/provider/auth.provider";

const PersonalDetails = () => {
  const { user, refreshUser } = useAuth();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateProfileMutation();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setPhoneNumber(user.phone || "");
      setGender(user.gender || "");
      if (user.dateOfBirth) {
        setDateOfBirth(parseISO(user.dateOfBirth));
      }
    }
  }, [user]);

  const handleSubmit = () => {
    const payload: any = {};

    if (fullName && fullName !== user?.name) payload.name = fullName;
    if (phoneNumber && phoneNumber !== user?.phone) payload.phone = phoneNumber;
    if (gender && gender !== user?.gender) payload.gender = gender;
    if (
      dateOfBirth &&
      format(dateOfBirth, "yyyy-MM-dd") !==
        (user?.dateOfBirth
          ? format(parseISO(user.dateOfBirth), "yyyy-MM-dd")
          : "")
    ) {
      payload.dateOfBirth = format(dateOfBirth, "yyyy-MM-dd");
    }

    if (Object.keys(payload).length === 0) {
      toast.error("No changes to update");
      return;
    }

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        refreshUser();
      },
    });
  };

  return (
    <Card className="rounded-t-none pt-6">
      <CardContent>
        <div className="grid grid-cols-12 md:gap-x-12 gap-y-5">
          {/* Full Name */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="fullName" className="mb-2">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          {/* Date of Birth */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="dob" className="mb-2">
              Date of Birth
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full text-left font-normal border border-default-200 flex justify-between text-default-600 bg-background"
                  )}
                >
                  {dateOfBirth ? (
                    format(dateOfBirth, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Gender */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="gender" className="mb-2">
              Gender
            </Label>
            <Select value={gender || undefined} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="phoneNumber" className="mb-2">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            color="secondary"
            onClick={() => {
              if (user) {
                setFullName(user.name || "");
                setPhoneNumber(user.phone || "");
                setGender(user.gender || "");
                setDateOfBirth(
                  user.dateOfBirth ? parseISO(user.dateOfBirth) : undefined
                );
              }
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalDetails;
