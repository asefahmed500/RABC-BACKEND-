import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// Role enum for RBAC
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    MODERATOR = 'moderator'
}

// Permission enum for granular access control
export enum Permission {
    READ_USERS = 'read:users',
    WRITE_USERS = 'write:users',
    DELETE_USERS = 'delete:users',
    READ_OWN_PROFILE = 'read:own_profile',
    WRITE_OWN_PROFILE = 'write:own_profile'
}

// Role-Permission mapping
export const RolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.USER]: [
        Permission.READ_OWN_PROFILE,
        Permission.WRITE_OWN_PROFILE
    ],
    [UserRole.MODERATOR]: [
        Permission.READ_OWN_PROFILE,
        Permission.WRITE_OWN_PROFILE,
        Permission.READ_USERS
    ],
    [UserRole.ADMIN]: [
        Permission.READ_OWN_PROFILE,
        Permission.WRITE_OWN_PROFILE,
        Permission.READ_USERS,
        Permission.WRITE_USERS,
        Permission.DELETE_USERS
    ]
};

// User interface
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    hasPermission(permission: Permission): boolean;
}

// User schema
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Don't return password by default
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Check if user has permission
userSchema.methods.hasPermission = function (permission: Permission): boolean {
    const userPermissions = RolePermissions[this.role as UserRole];
    return userPermissions.includes(permission);
};

// Create and export the model
const User = mongoose.model<IUser>('User', userSchema);

export default User;
