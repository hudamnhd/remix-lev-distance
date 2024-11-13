import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseIfString(input: string) {
	if (typeof input === "string") {
		try {
			return JSON.parse(input);
		} catch (error: unknown) {
			return null;
		}
	} else if (typeof input === "object" && input !== null) {
		return input;
	}
	return input;
}
