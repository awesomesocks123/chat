import React, { useState } from 'react';
import { Search, ArrowRight, Smartphone, MessageSquare, Building, Phone, Users, Layers, Shield, UserCog, CreditCard, Briefcase } from 'lucide-react';

// Introduction component
const Introduction = () => (
  <div className="card bg-base-100">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">Introduction to Chamo</h2>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          Chamo is a modern chat application designed to connect people from around the world. Whether you're looking to meet new friends, have interesting conversations, or just pass the time, Chamo provides a simple and secure platform for communication.
        </p>
        
        <h3 className="text-xl font-bold mb-4">Key Features</h3>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Random Chat Matching</strong> - Connect with new people through our random matching system</li>
          <li><strong>Secure Messaging</strong> - All messages are encrypted and secure</li>
          <li><strong>User Profiles</strong> - Customize your profile to express yourself</li>
          <li><strong>Theme Options</strong> - Choose between light and dark themes</li>
          <li><strong>User Blocking</strong> - Control who you interact with</li>
        </ul>
        
        <h3 className="text-xl font-bold my-4">Getting Started</h3>
        
        <p>
          To get started with Chamo, you'll need to create an account. Once you've signed up, you can immediately start chatting with other users through our random matching system or by searching for specific users.
        </p>
      </div>
    </div>
  </div>
);

// Creating an Account component
const CreatingAccount = () => (
  <div className="card bg-base-100">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">Creating an Account</h2>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          Setting up your Chamo account is quick and easy. Follow these steps to create your account and start chatting.
        </p>
        
        <h3 className="text-xl font-bold mb-4">Step-by-Step Guide</h3>
        
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <p><strong>Navigate to the Sign Up page</strong> - Click on the "Sign Up" button on the login screen</p>
          </li>
          <li>
            <p><strong>Enter your details</strong> - Provide your username, email address, and create a secure password</p>
          </li>
          <li>
            <p><strong>Verify your email</strong> - Check your inbox for a verification email and click the link to verify your account</p>
          </li>
          <li>
            <p><strong>Complete your profile</strong> - Add a profile picture and some information about yourself</p>
          </li>
          <li>
            <p><strong>Set your preferences</strong> - Choose your theme and notification settings</p>
          </li>
        </ol>
        
        <h3 className="text-xl font-bold my-4">Password Requirements</h3>
        
        <p>For your security, your password must meet the following requirements:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>At least 8 characters long</li>
          <li>Include at least one uppercase letter</li>
          <li>Include at least one number</li>
          <li>Include at least one special character</li>
        </ul>
      </div>
    </div>
  </div>
);

// Basic Navigation component
const BasicNavigation = () => (
  <div className="card bg-base-100">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">Basic Navigation</h2>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          Navigating around Chamo is designed to be intuitive and straightforward. Here's a guide to the main areas of the application.
        </p>
        
        <h3 className="text-xl font-bold mb-4">Main Navigation</h3>
        
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <p><strong>Home</strong> - The main chat interface where you can see your active conversations and start new ones</p>
          </li>
          <li>
            <p><strong>Profile</strong> - View and edit your profile information, including your username, bio, and profile picture</p>
          </li>
          <li>
            <p><strong>Settings</strong> - Adjust your application preferences, including theme, notifications, and privacy settings</p>
          </li>
          <li>
            <p><strong>Help</strong> - Access this help center for guidance on using Chamo</p>
          </li>
        </ul>
        
        <h3 className="text-xl font-bold my-4">Chat Interface</h3>
        
        <p>The chat interface consists of:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Sidebar</strong> - Shows your active chat sessions and allows you to start new ones</li>
          <li><strong>Chat Container</strong> - Displays the current conversation and message history</li>
          <li><strong>Message Input</strong> - Type your messages here and send them</li>
        </ul>
      </div>
    </div>
  </div>
);

// Starting a Chat component
const StartingChat = () => (
  <div className="card bg-base-100">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">Starting a Chat</h2>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          Chamo offers multiple ways to start conversations with other users. Here's how you can begin chatting.
        </p>
        
        <h3 className="text-xl font-bold mb-4">Random Chat Matching</h3>
        
        <p className="mb-4">
          The easiest way to start chatting is through our random matching system:
        </p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Click on the "Random Chat" button in the sidebar</li>
          <li>Wait a moment while we match you with another user</li>
          <li>Once matched, you can start sending messages right away</li>
        </ol>
        
        <div className="bg-base-200 p-4 rounded-lg my-4">
          <p className="text-sm"><strong>Note:</strong> Random chat matches are based on user availability. If you're matched with someone you've already chatted with, it means there are currently no new users available for matching.</p>
        </div>
        
        <h3 className="text-xl font-bold my-4">Resuming Existing Chats</h3>
        
        <p>
          To continue a previous conversation:
        </p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Find the user in your chat list in the sidebar</li>
          <li>Click on their name to open the conversation</li>
          <li>You can now continue your conversation where you left off</li>
        </ol>
      </div>
    </div>
  </div>
);

// Managing Conversations component
const ManagingConversations = () => (
  <div className="card bg-base-100">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">Managing Conversations</h2>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          Chamo provides several tools to help you manage your conversations effectively.
        </p>
        
        <h3 className="text-xl font-bold mb-4">Deleting a Chat</h3>
        
        <p className="mb-4">
          If you want to remove a conversation from your chat list:
        </p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Open the chat you want to delete</li>
          <li>Click on the three dots menu in the chat header</li>
          <li>Select "Delete Chat" from the dropdown menu</li>
          <li>Confirm the deletion when prompted</li>
        </ol>
        
        <div className="bg-base-200 p-4 rounded-lg my-4">
          <p className="text-sm"><strong>Note:</strong> Deleting a chat removes it from your list, but if the other user initiates a new conversation with you, it will appear in your list again.</p>
        </div>
        
        <h3 className="text-xl font-bold my-4">Organizing Your Chats</h3>
        
        <p>
          Your chats are automatically organized with the most recent conversations at the top. This makes it easy to find your active conversations quickly.
        </p>
      </div>
    </div>
  </div>
);

// Blocking Users component
const BlockingUsers = () => (
  <div className="card bg-base-100">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">Blocking Users</h2>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          If you encounter users who are behaving inappropriately, you can block them to prevent further communication.
        </p>
        
        <h3 className="text-xl font-bold mb-4">How to Block a User</h3>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Open the chat with the user you want to block</li>
          <li>Click on the three dots menu in the chat header</li>
          <li>Select "Block User" from the dropdown menu</li>
          <li>Optionally, provide a reason for blocking</li>
          <li>Confirm the action</li>
        </ol>
        
        <h3 className="text-xl font-bold my-4">Effects of Blocking</h3>
        
        <p className="mb-4">When you block a user:</p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>They will no longer be able to send you messages</li>
          <li>Their chat will be removed from your chat list</li>
          <li>You will not be matched with them again through random chat</li>
        </ul>
        
        <h3 className="text-xl font-bold my-4">Managing Blocked Users</h3>
        
        <p className="mb-4">To view and manage your blocked users:</p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Go to Settings</li>
          <li>Select "Privacy & Security"</li>
          <li>Click on "Blocked Users"</li>
          <li>Here you can see all blocked users and unblock them if desired</li>
        </ol>
      </div>
    </div>
  </div>
);
const ComingSoon = () => (
  <div className="card bg-base-100">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">Coming Soon</h2>
      <p className="mb-4">This feature is currently under development and will be available soon.</p>
    </div>
  </div>
);

// Get Started component (default view)
const GetStarted = () => (
  <div className="card bg-base-100">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">Get Started</h2>
      
      <div className="flex justify-end mb-4">
        <button className="btn btn-sm btn-outline gap-2">
          <span>Copy link</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="tabs tabs-boxed mb-6">
        <a className="tab tab-active">All Platforms</a>
        <a className="tab">Android</a>
        <a className="tab">iOS</a>
      </div>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          Welcome to Chamo. With Chamo, you'll get fast, simple, and secure messaging and
          calling available on devices all over the world. To get started, download Chamo for free from
          the App Store or Google Play Store.
        </p>
        
        <p className="mb-4">
          Scan the QR code with your phone's camera and tap the link to be taken to the download page on the Play Store.
        </p>
        
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 bg-base-300 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2">
                <Smartphone className="w-12 h-12 mx-auto text-primary" />
              </div>
              <p className="text-sm">QR Code Placeholder</p>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-4">Set up Chamo</h3>
        
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <p><strong>Download and install the app</strong> - Get Chamo from your device's app store</p>
          </li>
          <li>
            <p><strong>Verify your phone number</strong> - Chamo will send you a verification code</p>
          </li>
          <li>
            <p><strong>Set up your profile</strong> - Add a profile picture and your name</p>
          </li>
          <li>
            <p><strong>Start chatting</strong> - Find friends or get matched with random users</p>
          </li>
        </ol>
      </div>
    </div>
  </div>
);



export const HelpPage = () => {
  const [activeTopic, setActiveTopic] = useState('get-started');
  
  // Function to handle topic changes
  const handleTopicChange = (topic) => {
    setActiveTopic(topic);
  };
  return (
    <div className="min-h-screen bg-base-100 pt-16">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar */}
          <div className="w-full md:w-1/4 bg-base-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-content" />
              </div>
              <h1 className="text-xl font-bold">Help Center</h1>
            </div>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-base-content/50" />
              </div>
              <input 
                type="text" 
                placeholder="Search help articles..." 
                className="input input-bordered w-full pl-10"
              />
            </div>
            
            <div className="space-y-1">
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" defaultChecked /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="font-medium">Get Started</span>
                </div>
                <div className="collapse-content pl-12">
                  <ul className="space-y-2">
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'introduction' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('introduction')}
                    >Introduction</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'creating-account' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('creating-account')}
                    >Creating an Account</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'basic-navigation' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('basic-navigation')}
                    >Basic Navigation</li>
                  </ul>
                </div>
              </div>
              
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium">Chats</span>
                </div>
                <div className="collapse-content pl-12">
                  <ul className="space-y-2">
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'starting-chat' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('starting-chat')}
                    >Starting a Chat</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'managing-conversations' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('managing-conversations')}
                    >Managing Conversations</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'blocking-users' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('blocking-users')}
                    >Blocking Users</li>
                  </ul>
                </div>
              </div>
              
              
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="font-medium">Voice and Video Calls</span>
                </div>
                <div className="collapse-content pl-12">
                  <ul className="space-y-2">
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'coming-soon' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('coming-soon')}
                    >Coming Soon</li>
                  </ul>
                </div>
              </div>
              
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">Communities & Spaces</span>
                </div>
                <div className="collapse-content pl-12"></div>
              </div>
        
              
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">Privacy, Safety, and Security</span>
                </div>
                <div className="collapse-content pl-12"></div>
              </div>
              
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <UserCog className="w-5 h-5 text-primary" />
                  <span className="font-medium">Accounts and Account Bans</span>
                </div>
                <div className="collapse-content pl-12"></div>
              </div>

            </div>
          </div>
          
          {/* Main content */}
          <div className="w-full md:w-3/4 bg-base-100">
            {activeTopic === 'get-started' && <GetStarted />}
            {activeTopic === 'introduction' && <Introduction />}
            {activeTopic === 'creating-account' && <CreatingAccount />}
            {activeTopic === 'basic-navigation' && <BasicNavigation />}
            {activeTopic === 'starting-chat' && <StartingChat />}
            {activeTopic === 'managing-conversations' && <ManagingConversations />}
            {activeTopic === 'blocking-users' && <BlockingUsers />}
            {activeTopic === 'coming-soon' && <ComingSoon />}
          </div>
        </div>
      </div>
    </div>
  );
};
