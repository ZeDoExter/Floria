import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { Account } from '../../entities/account.entity.js';
import { User } from '../../entities/user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginDto) {
    if (!dto.email || !dto.password) {
      throw new UnauthorizedException('Email and password are required');
    }

    // Find or create account
    let account = await this.accountRepository.findOne({
      where: { email: dto.email },
      relations: ['user']
    });

    if (!account) {
      // For development: create account with any password
      // In production, this should require registration first
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      account = this.accountRepository.create({
        email: dto.email,
        password: hashedPassword,
        isVerified: true
      });
      account = await this.accountRepository.save(account);

      // Create user
      const user = this.userRepository.create({
        accountId: account.id,
        email: dto.email,
        firstName: dto.email.split('@')[0] || null
      });
      await this.userRepository.save(user);

      // Reload account with user
      account = await this.accountRepository.findOne({
        where: { id: account.id },
        relations: ['user']
      });
      
      if (!account) {
        throw new UnauthorizedException('Failed to create account');
      }
    } else {
      // Verify password
      if (account.password && !(await bcrypt.compare(dto.password, account.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    // Ensure user exists
    if (!account.user) {
      // Create user if doesn't exist
      const newUser = this.userRepository.create({
        accountId: account.id,
        email: dto.email,
        firstName: dto.email.split('@')[0] || null
      });
      await this.userRepository.save(newUser);
      
      // Reload account with user
      const reloadedAccount = await this.accountRepository.findOne({
        where: { id: account.id },
        relations: ['user']
      });
      
      if (!reloadedAccount || !reloadedAccount.user) {
        throw new UnauthorizedException('Failed to create user');
      }
      
      account = reloadedAccount;
    }

    // After the if block above, account.user is guaranteed to exist
    // Use non-null assertion since we've verified it exists
    const user = account.user!;

    // Generate JWT token
    const payload = {
      sub: account.email,
      userId: user.id,
      email: account.email,
      displayName: user.firstName || account.email.split('@')[0] || account.email
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: account.email,
        displayName: payload.displayName
      }
    };
  }

  async register(email: string, password: string, firstName?: string, lastName?: string) {
    const existingAccount = await this.accountRepository.findOne({
      where: { email }
    });

    if (existingAccount) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const account = this.accountRepository.create({
      email,
      password: hashedPassword,
      isVerified: false
    });
    const savedAccount = await this.accountRepository.save(account);

    const user = this.userRepository.create({
      accountId: savedAccount.id,
      email,
      firstName: firstName || null,
      lastName: lastName || null
    });
    await this.userRepository.save(user);

    return {
      account: {
        id: savedAccount.id,
        email: savedAccount.email,
        isVerified: savedAccount.isVerified
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }
}
